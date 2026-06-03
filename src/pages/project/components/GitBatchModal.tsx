import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Modal, Progress, Select, Tag } from 'antd';
import NProject from '../NProject';
import SProject from '../SProject';

const { Option } = Select;

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
}

const STATUS_TAG: Record<GitBatchItemStatus, { color: string; text: string }> = {
  pending: { color: 'default', text: '等待' },
  running: { color: 'processing', text: '执行中' },
  success: { color: 'success', text: '成功' },
  stashed_success: { color: 'success', text: '成功' },
  conflict: { color: 'warning', text: '冲突' },
  failed: { color: 'error', text: '失败' },
};

/** 从 git 输出里提取一行可读原因 */
function simplifyMessage(raw: string): string {
  if (!raw) return '未知错误';
  const line = raw.split('\n').map((s) => s.trim()).find(Boolean) || raw;
  return line.length > 120 ? line.slice(0, 120) + '…' : line;
}

const GitBatchModal: React.FC<GitBatchModalProps> = ({ visible, projects, onClose }) => {
  const [action, setAction] = useState<'pull'>('pull');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<IGitBatchRow[]>([]);
  const [running, setRunning] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [logRow, setLogRow] = useState<IGitBatchRow | null>(null);
  const runningRef = useRef(false);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  const eligibleProjects = projects.filter((p) => p.rootPath && !p.isSfMock);

  useEffect(() => {
    if (!visible) return;
    const eligible = projectsRef.current.filter((p) => p.rootPath && !p.isSfMock);
    SProject.getGitBatchPref().then((rsp: any) => {
      const pref = rsp.pref;
      if (pref) {
        const ids: number[] = pref.lastSelectedProjectIds || [];
        const validIds = ids.filter((id) => eligible.some((p) => p.id === id));
        setSelectedIds(validIds.length ? validIds : eligible.map((p) => p.id!));
      } else {
        setSelectedIds(eligible.map((p) => p.id!));
      }
    });
    if (!runningRef.current) {
      setRows([]);
      setDoneCount(0);
      setRunning(false);
      setLogRow(null);
    }
  }, [visible]);

  const allSelected = selectedIds.length === eligibleProjects.length && eligibleProjects.length > 0;
  const indeterminate = selectedIds.length > 0 && !allSelected;

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? eligibleProjects.map((p) => p.id!) : []);
  };

  const toggleOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const updateRow = (projectId: number, patch: Partial<IGitBatchRow>) => {
    setRows((prev) => prev.map((r) => (r.project.id === projectId ? { ...r, ...patch } : r)));
  };

  const handleExecute = async () => {
    if (!selectedIds.length || runningRef.current) return;

    const eligible = projectsRef.current.filter((p) => p.rootPath && !p.isSfMock);
    const initialRows: IGitBatchRow[] = selectedIds
      .map((id) => eligible.find((p) => p.id === id))
      .filter(Boolean)
      .map((p) => ({
        project: p!,
        status: 'pending' as GitBatchItemStatus,
        message: '',
        steps: [],
      }));

    setRows(initialRows);
    setRunning(true);
    runningRef.current = true;
    setDoneCount(0);
    setLogRow(null);

    let finished = 0;

    const tasks = initialRows.map((row) => {
      const projectId = row.project.id!;
      return (async () => {
        updateRow(projectId, { status: 'running', message: '' });
        try {
          const rsp: any = await SProject.gitExecuteOne({ projectId, action });
          const result = rsp.result;
          const status = (result?.status as GitBatchItemStatus) || 'failed';
          const safeStatus = STATUS_TAG[status] ? status : 'failed';
          let message = result?.message || '';
          if (safeStatus === 'success' || safeStatus === 'stashed_success') {
            message = '';
          } else if (safeStatus === 'conflict') {
            message = '存在冲突，需手动处理';
          } else {
            message = simplifyMessage(message);
          }
          updateRow(projectId, {
            status: safeStatus,
            message,
            steps: result?.steps || [],
            elapsed: result?.elapsed,
          });
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
    setRunning(false);
    SProject.saveGitBatchPref({ lastAction: action, lastSelectedProjectIds: selectedIds });
  };

  const total = rows.length;
  const progressPercent = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <>
      <Modal
        title="Git 操作"
        open={visible}
        onCancel={onClose}
        width={560}
        maskClosable={!running}
        footer={[
          <Button key="cancel" onClick={onClose} disabled={running}>关闭</Button>,
          <Button key="run" type="primary" loading={running} disabled={!selectedIds.length || running} onClick={handleExecute}>
            开始执行
          </Button>,
        ]}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#666' }}>操作</span>
          <Select value={action} style={{ width: 100 }} disabled={running}>
            <Option value="pull">拉取</Option>
          </Select>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Checkbox indeterminate={indeterminate} checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} disabled={running}>
            全选
          </Checkbox>
          <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
            {selectedIds.length} / {eligibleProjects.length}
          </span>
        </div>

        <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #f0f0f0', borderRadius: 4, padding: '4px 8px', marginBottom: 12 }}>
          {eligibleProjects.map((p) => (
            <div key={p.id} style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Checkbox checked={selectedIds.includes(p.id!)} onChange={(e) => toggleOne(p.id!, e.target.checked)} disabled={running} />
              <span style={{ fontWeight: 500 }}>{p.name}</span>
            </div>
          ))}
        </div>

        {rows.length > 0 && (
          <>
            <Progress percent={progressPercent} format={() => `${doneCount}/${total}`} status={running ? 'active' : 'normal'} style={{ marginBottom: 10 }} />
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {rows.map((row) => {
                const tag = STATUS_TAG[row.status] || STATUS_TAG.failed;
                const showLog = row.steps.length > 0 && row.status !== 'success' && row.status !== 'stashed_success';
                return (
                  <div key={row.project.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                    <span style={{ width: 160, fontWeight: 500, flexShrink: 0 }}>{row.project.name}</span>
                    <Tag color={tag.color} style={{ margin: 0, flexShrink: 0 }}>{tag.text}</Tag>
                    <span style={{ flex: 1, fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.message}
                    </span>
                    {showLog && (
                      <Button type="link" size="small" style={{ flexShrink: 0, padding: 0 }} onClick={() => setLogRow(row)}>
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

      {/* 日志弹窗 */}
      <Modal
        title={logRow ? `日志 · ${logRow.project.name}` : '日志'}
        open={!!logRow}
        onCancel={() => setLogRow(null)}
        footer={<Button onClick={() => setLogRow(null)}>关闭</Button>}
        width={560}
      >
        {logRow && (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{logRow.project.rootPath}</div>
            {logRow.steps.map((s, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <Tag color={s.ok ? 'green' : 'red'}>{s.action}</Tag>
                <pre style={{ fontSize: 11, margin: '4px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-all', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
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
