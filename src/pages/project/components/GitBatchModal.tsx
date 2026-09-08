import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Modal, Progress, Space, Tag, message } from 'antd';
import NProject from '../NProject';
import SProject from '../SProject';

export type BatchAction = 'pull' | 'start';

export type GitBatchItemStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'stashed_success'
  | 'conflict'
  | 'failed';

interface IGitBatchRow {
  project: NProject;
  status: GitBatchItemStatus;
  message: string;
  steps: { action: string; ok: boolean; output: string }[];
  elapsed?: number;
}

interface GitBatchModalProps {
  visible: boolean;
  projects: NProject[];
  onClose: () => void;
  /** 批量执行结束后回调（如刷新列表、更新分支） */
  onComplete?: (action: BatchAction) => void;
}

const STATUS_TAG: Record<GitBatchItemStatus, { color: string; text: string }> = {
  pending: { color: 'default', text: '等待' },
  running: { color: 'processing', text: '执行中' },
  success: { color: 'success', text: '成功' },
  stashed_success: { color: 'success', text: '成功' },
  conflict: { color: 'warning', text: '冲突' },
  failed: { color: 'error', text: '失败' },
};

const ACTION_LABEL: Record<BatchAction, string> = {
  pull: '拉取',
  start: '启动',
};

function simplifyMessage(raw: string): string {
  if (!raw) return '未知错误';
  const line = raw.split('\n').map((s) => s.trim()).find(Boolean) || raw;
  return line.length > 120 ? line.slice(0, 120) + '…' : line;
}

function canPull(p: NProject) {
  return Boolean(p.rootPath);
}

function canStart(p: NProject) {
  return (
    p.name !== 'sf-notes' &&
    Boolean(p.rootPath) &&
    Boolean(p.startConfig?.commands?.length)
  );
}

function canBatch(p: NProject) {
  return canPull(p) || canStart(p);
}

function canRunAction(p: NProject, action: BatchAction) {
  return action === 'pull' ? canPull(p) : canStart(p);
}

const GitBatchModal: React.FC<GitBatchModalProps> = ({
  visible,
  projects,
  onClose,
  onComplete,
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<IGitBatchRow[]>([]);
  const [runningAction, setRunningAction] = useState<BatchAction | null>(null);
  const [resultAction, setResultAction] = useState<BatchAction | null>(null);
  const [doneCount, setDoneCount] = useState(0);
  const [logRow, setLogRow] = useState<IGitBatchRow | null>(null);
  const runningRef = useRef(false);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  const listProjects = useMemo(() => projects.filter(canBatch), [projects]);

  useEffect(() => {
    if (!visible) return;
    SProject.getGitBatchPref().then((rsp: any) => {
      const pref = rsp.pref;
      const ids: number[] = pref?.lastSelectedProjectIds || [];
      const validIds = ids.filter((id) =>
        projectsRef.current.some((p) => p.id === id && canBatch(p))
      );
      setSelectedIds(validIds);
    });
    if (!runningRef.current) {
      setRows([]);
      setDoneCount(0);
      setRunningAction(null);
      setResultAction(null);
      setLogRow(null);
    }
  }, [visible]);

  const allSelected =
    selectedIds.length === listProjects.length && listProjects.length > 0;
  const indeterminate = selectedIds.length > 0 && !allSelected;
  const running = runningAction !== null;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? listProjects.map((p) => p.id!) : []);
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const updateRow = (projectId: number, patch: Partial<IGitBatchRow>) => {
    setRows((prev) =>
      prev.map((r) => (r.project.id === projectId ? { ...r, ...patch } : r))
    );
  };

  async function runPull(project: NProject) {
    const rsp: any = await SProject.gitExecuteOne({
      projectId: project.id!,
      action: 'pull',
    });
    const result = rsp.result;
    const status = (result?.status as GitBatchItemStatus) || 'failed';
    const safeStatus = STATUS_TAG[status] ? status : 'failed';
    let messageText = result?.message || '';
    if (safeStatus === 'success' || safeStatus === 'stashed_success') {
      messageText = '';
    } else if (safeStatus === 'conflict') {
      messageText = '存在冲突，需手动处理';
    } else {
      messageText = simplifyMessage(messageText);
    }
    return {
      status: safeStatus,
      message: messageText,
      steps: result?.steps || [],
      elapsed: result?.elapsed,
    };
  }

  async function runStart(project: NProject) {
    const rsp = await SProject.startProjectWithCommands({
      projectId: project.id!,
      projectName: project.name,
    });
    if (rsp.success) {
      return {
        status: 'success' as GitBatchItemStatus,
        message: '',
        steps: [],
      };
    }
    return {
      status: 'failed' as GitBatchItemStatus,
      message: simplifyMessage((rsp as any).message || '启动失败'),
      steps: [],
    };
  }

  const handleExecute = async (action: BatchAction) => {
    if (!selectedIds.length) return;
    if (runningRef.current) {
      message.warning('有操作正在执行');
      return;
    }

    const targets = selectedIds
      .map((id) => projectsRef.current.find((p) => p.id === id))
      .filter((p): p is NProject => Boolean(p))
      .filter((p) => canRunAction(p, action));

    if (!targets.length) {
      message.warning(
        action === 'pull'
          ? '所选项目中没有可拉取的'
          : '所选项目中没有可启动的（需配置启动命令）'
      );
      return;
    }

    const initialRows: IGitBatchRow[] = targets.map((p) => ({
      project: p,
      status: 'pending' as GitBatchItemStatus,
      message: '',
      steps: [],
    }));

    setRows(initialRows);
    setRunningAction(action);
    setResultAction(action);
    runningRef.current = true;
    setDoneCount(0);
    setLogRow(null);

    let finished = 0;

    const tasks = initialRows.map((row) => {
      const projectId = row.project.id!;
      return (async () => {
        updateRow(projectId, { status: 'running', message: '' });
        try {
          const result =
            action === 'pull'
              ? await runPull(row.project)
              : await runStart(row.project);
          updateRow(projectId, result);
        } catch (e: any) {
          updateRow(projectId, {
            status: 'failed',
            message: simplifyMessage(e?.message || '请求失败'),
            steps: [],
          });
        } finally {
          finished++;
          setDoneCount(finished);
        }
      })();
    });

    await Promise.allSettled(tasks);
    runningRef.current = false;
    setRunningAction(null);
    SProject.saveGitBatchPref({
      lastAction: action,
      lastSelectedProjectIds: selectedIds,
    });
    onComplete?.(action);
  };

  const total = rows.length;
  const progressPercent = total ? Math.round((doneCount / total) * 100) : 0;
  const selectedCount = selectedIds.length;
  const actionLabel = (runningAction || resultAction)
    ? ACTION_LABEL[runningAction || resultAction!]
    : '';

  return (
    <>
      <Modal
        title="批量操作"
        open={visible}
        onCancel={onClose}
        width={760}
        style={{ top: '7.5vh' }}
        bodyStyle={{
          height: 'calc(85vh - 110px)',
          maxHeight: 'calc(85vh - 110px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 12,
        }}
        maskClosable={!running}
        footer={
          <Button onClick={onClose}>
            关闭
          </Button>
        }
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            flexShrink: 0,
          }}
        >
          <div>
            <Checkbox
              indeterminate={indeterminate}
              checked={allSelected}
              onChange={(e) => toggleAll(e.target.checked)}
            >
              全选
            </Checkbox>
            <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
              {selectedCount} / {listProjects.length}
            </span>
          </div>
          <Space>
            <Button
              loading={runningAction === 'pull'}
              disabled={!selectedCount}
              onClick={() => handleExecute('pull')}
            >
              拉取
            </Button>
            <Button
              type="primary"
              loading={runningAction === 'start'}
              disabled={!selectedCount}
              onClick={() => handleExecute('start')}
            >
              启动
            </Button>
          </Space>
        </div>

        <div
          style={{
            flex: rows.length > 0 ? '1 1 45%' : '1 1 auto',
            minHeight: 200,
            overflowY: 'auto',
            border: '1px solid #f0f0f0',
            borderRadius: 4,
            padding: '4px 12px',
            marginBottom: rows.length > 0 ? 12 : 0,
          }}
        >
          {listProjects.length === 0 ? (
            <div style={{ padding: '8px 0', color: '#999', fontSize: 13 }}>
              没有可批量操作的项目
            </div>
          ) : (
            listProjects.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '6px 0',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Checkbox
                  checked={selectedIds.includes(p.id!)}
                  onChange={(e) => toggleOne(p.id!, e.target.checked)}
                >
                  <span
                    style={{
                      fontWeight: 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={p.name}
                  >
                    {p.name}
                  </span>
                </Checkbox>
              </div>
            ))
          )}
        </div>

        {rows.length > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                flexShrink: 0,
                fontSize: 13,
              }}
            >
              <span style={{ color: '#666' }}>
                {running ? `正在${actionLabel}` : `已执行 · ${actionLabel}`}
              </span>
            </div>
            <Progress
              percent={progressPercent}
              format={() => `${doneCount}/${total}`}
              status={running ? 'active' : 'normal'}
              style={{ marginBottom: 10, flexShrink: 0 }}
            />
            <div style={{ flex: '1 1 40%', minHeight: 120, overflowY: 'auto' }}>
              {rows.map((row) => {
                const tag = STATUS_TAG[row.status] || STATUS_TAG.failed;
                const showLog =
                  row.steps.length > 0 &&
                  row.status !== 'success' &&
                  row.status !== 'stashed_success';
                return (
                  <div
                    key={row.project.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid #f5f5f5',
                    }}
                  >
                    <span
                      style={{
                        width: 180,
                        fontWeight: 500,
                        flexShrink: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.project.name}
                    >
                      {row.project.name}
                    </span>
                    <Tag color={tag.color} style={{ margin: 0, flexShrink: 0 }}>
                      {tag.text}
                    </Tag>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: '#888',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.message}
                    </span>
                    {showLog && (
                      <Button
                        type="link"
                        size="small"
                        style={{ flexShrink: 0, padding: 0 }}
                        onClick={() => setLogRow(row)}
                      >
                        日志
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>

      <Modal
        title={logRow ? `日志 · ${logRow.project.name}` : '日志'}
        open={!!logRow}
        onCancel={() => setLogRow(null)}
        footer={<Button onClick={() => setLogRow(null)}>关闭</Button>}
        width={720}
      >
        {logRow && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
              {logRow.project.rootPath}
            </div>
            {logRow.steps.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <Tag color={s.ok ? 'green' : 'red'}>{s.action}</Tag>
                <pre
                  style={{
                    fontSize: 11,
                    margin: '4px 0 0',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    background: '#f5f5f5',
                    padding: 8,
                    borderRadius: 4,
                  }}
                >
                  {s.output || '(无输出)'}
                </pre>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
};

export default GitBatchModal;
