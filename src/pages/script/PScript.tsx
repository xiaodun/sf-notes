import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Input,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from "antd";
import {
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  MobileOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import SelfStyle from "./LScript.less";
import SScript from "./SScript";
import NScript, {
  AdbExecMode,
  CustomScript,
  DeviceProfile,
  ExecutionRecord,
  ScriptItem,
  ScriptTaskStatus,
  TaskLog,
} from "./NScript";
import ScriptEditorModal, { IScriptEditorModal } from "./components/ScriptEditorModal";

const LS_KEY = "script_last_params";

function loadSavedParams(scriptId: string): Record<string, string> {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return all[scriptId] || {};
  } catch {
    return {};
  }
}

function saveParams(scriptId: string, params: Record<string, string>) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    all[scriptId] = params;
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch (_) {}
}

const PScript: React.FC = () => {
  const editorRef = useRef<IScriptEditorModal>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<number | null>(null);
  const pollInFlightRef = useRef(false);
  const pollSettledRef = useRef(false);

  const [customScripts, setCustomScripts] = useState<CustomScript[]>([]);
  const [devices, setDevices] = useState<DeviceProfile[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>(NScript.BUILTIN_SCRIPTS[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [taskStatus, setTaskStatus] = useState<ScriptTaskStatus["status"] | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [saveDeviceName, setSaveDeviceName] = useState("");

  const allScripts = useMemo<ScriptItem[]>(() => {
    return [
      ...NScript.BUILTIN_SCRIPTS,
      ...customScripts.map(NScript.customToScriptItem),
    ];
  }, [customScripts]);

  const selectedScript = useMemo(
    () => allScripts.find((s) => s.id === selectedId) || allScripts[0],
    [allScripts, selectedId]
  );

  const isAdbScript = selectedScript?.builtinKey === "adb-wireless";

  const selectedCustom = useMemo(
    () => customScripts.find((s) => s.id === selectedId),
    [customScripts, selectedId]
  );

  const loadData = useCallback(async () => {
    const rsp = await SScript.getList();
    if (rsp.success && rsp.data) {
      setCustomScripts(rsp.data.customScripts || []);
      setDevices(rsp.data.devices || []);
      setExecutions(rsp.data.executions || []);
    }
  }, []);

  useEffect(() => {
    loadData();
    document.title = "脚本";
  }, [loadData]);

  useEffect(() => {
    if (!selectedScript) return;
    const saved = loadSavedParams(selectedScript.id);
    const defaults: Record<string, string> = {};
    selectedScript.params.forEach((p) => {
      defaults[p.key] = saved[p.key] ?? p.defaultValue ?? "";
    });
    setParamValues(defaults);
  }, [selectedScript]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [taskLogs]);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const pollTask = (taskId: string) => {
    stopPolling();
    pollInFlightRef.current = false;
    pollSettledRef.current = false;

    const finishOnce = async (task: ScriptTaskStatus) => {
      if (pollSettledRef.current) return;
      pollSettledRef.current = true;
      stopPolling();
      setRunning(false);
      setTaskLogs(task.logs || []);
      setTaskStatus(task.status === "missing" ? "failed" : task.status);

      if (task.status === "missing") return;

      await SScript.saveExecution(taskId);
      loadData();
      if (task.status === "success") {
        message.success(task.message || "执行完成");
      } else {
        message.error(task.message || "执行失败");
      }
    };

    const tick = async () => {
      if (pollSettledRef.current || pollInFlightRef.current) return;
      pollInFlightRef.current = true;
      try {
        const rsp = await SScript.getTaskStatus(taskId);
        if (pollSettledRef.current) return;
        if (!rsp.success || !rsp.data) return;
        const task = rsp.data;
        if (task.status === "missing" || task.status !== "running") {
          await finishOnce(task);
          return;
        }
        setTaskLogs(task.logs || []);
        setTaskStatus(task.status);
      } finally {
        pollInFlightRef.current = false;
      }
    };

    tick();
    pollTimerRef.current = window.setInterval(tick, 800);
  };

  const validateCustomParams = (): boolean => {
    if (!selectedScript) return false;
    for (const p of selectedScript.params) {
      if (p.required && !String(paramValues[p.key] || "").trim()) {
        message.warning(`请填写${p.label}`);
        return false;
      }
    }
    return true;
  };

  const handleExecute = async (adbMode?: AdbExecMode) => {
    if (!selectedScript) return;

    if (isAdbScript && adbMode) {
      const err = NScript.adbValidate(adbMode, paramValues);
      if (err) {
        message.warning(err);
        return;
      }
    } else if (!validateCustomParams()) {
      return;
    }

    saveParams(selectedScript.id, paramValues);
    setRunning(true);
    setTaskLogs([]);
    setTaskStatus("running");
    setCurrentTaskId(null);

    const execParams = isAdbScript && adbMode
      ? { ...paramValues, mode: adbMode }
      : { ...paramValues };

    const actionLabel =
      adbMode === "pair" ? "配对并连接" : adbMode === "connect" ? "直接连接" : "";

    const rsp = await SScript.executeScript({
      scriptId: selectedScript.id,
      scriptName: actionLabel
        ? `${selectedScript.name} · ${actionLabel}`
        : selectedScript.name,
      scriptType: selectedScript.kind,
      builtinKey: selectedScript.builtinKey,
      customScript: selectedCustom,
      params: execParams,
    });

    if (!rsp.success || !rsp.data?.taskId) {
      setRunning(false);
      message.error(rsp.message || "启动失败");
      return;
    }

    setCurrentTaskId(rsp.data.taskId);
    pollTask(rsp.data.taskId);
  };

  const handleApplyDevice = (device: DeviceProfile) => {
    setParamValues((prev) => ({
      ...prev,
      address: device.address,
      pairPort: device.pairPort || prev.pairPort || "",
      connectPort: device.connectPort || prev.connectPort || "",
    }));
    message.success(`已填入「${device.name}」`);
  };

  const handleSaveDevice = async () => {
    const name = saveDeviceName.trim() || paramValues.address;
    if (!name || !paramValues.address) {
      message.warning("请先填写设备地址");
      return;
    }
    const rsp = await SScript.saveDevice({
      name,
      address: paramValues.address,
      pairPort: paramValues.pairPort,
      connectPort: paramValues.connectPort,
    });
    if (rsp.success) {
      message.success("设备已保存");
      setSaveDeviceName("");
      loadData();
    }
  };

  const handleDeleteScript = async (id: string) => {
    const rsp = await SScript.delScript(id);
    if (rsp.success) {
      message.success("已删除");
      if (selectedId === id) {
        setSelectedId(NScript.BUILTIN_SCRIPTS[0].id);
      }
      loadData();
    }
  };

  const handleDeleteDevice = async (id: string) => {
    const rsp = await SScript.delDevice(id);
    if (rsp.success) {
      loadData();
    }
  };

  const statusTag = () => {
    if (!taskStatus) return null;
    const map = {
      running: { color: "processing", text: "执行中" },
      success: { color: "success", text: "成功" },
      failed: { color: "error", text: "失败" },
      missing: { color: "default", text: "已结束" },
    } as const;
    const item = map[taskStatus];
    return <Badge status={item.color} text={item.text} />;
  };

  const renderParamInput = (p: { key: string; label: string; placeholder?: string }) => (
    <div key={p.key} className={SelfStyle.paramField}>
      <label className={SelfStyle.paramLabel}>{p.label}</label>
      <Input
        value={paramValues[p.key] || ""}
        placeholder={p.placeholder}
        onChange={(e) => {
          const value = e.target.value;
          const key = p.key;
          setParamValues((prev) => ({ ...prev, [key]: value }));
        }}
        disabled={running}
      />
    </div>
  );

  return (
    <div className={SelfStyle.pageRoot}>
      <div className={SelfStyle.main}>
        <aside className={SelfStyle.sidebar}>
          <div className={SelfStyle.sidebarHeader}>
            <CodeOutlined style={{ marginRight: 6 }} />
            脚本
          </div>
          <div className={SelfStyle.sectionTitle}>内置</div>
          {NScript.BUILTIN_SCRIPTS.map((item) => (
            <div
              key={item.id}
              className={`${SelfStyle.scriptItem} ${selectedId === item.id ? SelfStyle.active : ""}`}
              onClick={() => setSelectedId(item.id)}
            >
              <div className={SelfStyle.scriptName}>{item.name}</div>
              <div className={SelfStyle.scriptDesc}>{item.description}</div>
            </div>
          ))}

          <div className={SelfStyle.sectionTitle}>
            自定义
            <Button
              type="link"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => editorRef.current?.open()}
              style={{ float: "right", padding: 0, height: "auto" }}
            />
          </div>
          {customScripts.length === 0 && (
            <div style={{ padding: "4px 12px", fontSize: 12, color: "#bbb" }}>暂无自定义脚本</div>
          )}
          {customScripts.map((item) => (
            <div
              key={item.id}
              className={`${SelfStyle.scriptItem} ${selectedId === item.id ? SelfStyle.active : ""}`}
              onClick={() => setSelectedId(item.id)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className={SelfStyle.scriptName}>{item.name}</div>
                <Space size={4} onClick={(e) => e.stopPropagation()}>
                  <EditOutlined
                    style={{ color: "#999", fontSize: 12 }}
                    onClick={() => editorRef.current?.open(item)}
                  />
                  <Popconfirm title="删除此脚本？" onConfirm={() => handleDeleteScript(item.id)}>
                    <DeleteOutlined style={{ color: "#999", fontSize: 12 }} />
                  </Popconfirm>
                </Space>
              </div>
              {item.description && <div className={SelfStyle.scriptDesc}>{item.description}</div>}
            </div>
          ))}

          {devices.length > 0 && (
            <>
              <div className={SelfStyle.sectionTitle}>
                <MobileOutlined style={{ marginRight: 4 }} />
                设备
              </div>
              {devices.map((d) => (
                <div key={d.id} className={SelfStyle.deviceItem} onClick={() => handleApplyDevice(d)}>
                  <span>
                    {d.name}
                    <span style={{ color: "#bbb", marginLeft: 6 }}>{d.address}</span>
                  </span>
                  <Popconfirm title="删除？" onConfirm={() => handleDeleteDevice(d.id)}>
                    <DeleteOutlined style={{ color: "#ccc" }} onClick={(e) => e.stopPropagation()} />
                  </Popconfirm>
                </div>
              ))}
            </>
          )}
        </aside>

        <section className={SelfStyle.content}>
          {selectedScript ? (
            <>
              <div className={SelfStyle.contentHeader}>
                <div className={SelfStyle.titleRow}>
                  <h2 className={SelfStyle.title}>{selectedScript.name}</h2>
                  <Tag color={selectedScript.kind === "builtin" ? "blue" : "default"}>
                    {selectedScript.kind === "builtin" ? "内置" : "自定义"}
                  </Tag>
                </div>
                {selectedScript.description && (
                  <p className={SelfStyle.desc}>{selectedScript.description}</p>
                )}
                {selectedScript.kind === "custom" && selectedScript.command && (
                  <pre
                    style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      background: "#f5f5f5",
                      borderRadius: 4,
                      fontSize: 12,
                      overflow: "auto",
                    }}
                  >
                    {selectedScript.command}
                  </pre>
                )}
              </div>

              <div className={SelfStyle.formArea}>
                {isAdbScript ? (
                  <>
                    <div className={SelfStyle.paramSection}>
                      <div className={SelfStyle.paramSectionLabel}>连接信息</div>
                      <div className={SelfStyle.paramGrid}>
                        {selectedScript.params
                          .filter((p) => p.key === "address" || p.key === "connectPort")
                          .map(renderParamInput)}
                      </div>
                    </div>
                    <div className={SelfStyle.paramSection}>
                      <div className={SelfStyle.paramSectionLabel}>配对信息（配对并连接时使用）</div>
                      <div className={SelfStyle.paramGrid}>
                        {selectedScript.params
                          .filter((p) => p.key === "pairPort" || p.key === "pairCode")
                          .map(renderParamInput)}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={SelfStyle.paramGrid}>
                    {selectedScript.params.map(renderParamInput)}
                  </div>
                )}
                <div className={SelfStyle.actionBar}>
                  {isAdbScript ? (
                    <>
                      <Button
                        type="primary"
                        icon={<CaretRightOutlined />}
                        loading={running}
                        onClick={() => handleExecute("connect")}
                      >
                        直接连接
                      </Button>
                      <Button loading={running} onClick={() => handleExecute("pair")}>
                        配对并连接
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="primary"
                      icon={<CaretRightOutlined />}
                      loading={running}
                      onClick={() => handleExecute()}
                    >
                      执行
                    </Button>
                  )}
                  {isAdbScript && (
                    <>
                      <Input
                        placeholder="设备名称（保存用）"
                        value={saveDeviceName}
                        onChange={(e) => setSaveDeviceName(e.target.value)}
                        style={{ width: 160 }}
                        disabled={running}
                      />
                      <Tooltip title="保存当前地址与端口，下次一键填入">
                        <Button icon={<SaveOutlined />} onClick={handleSaveDevice} disabled={running}>
                          保存设备
                        </Button>
                      </Tooltip>
                    </>
                  )}
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setTaskLogs([]);
                      setTaskStatus(null);
                      setCurrentTaskId(null);
                    }}
                    disabled={running}
                  >
                    清空输出
                  </Button>
                </div>
              </div>

              <div className={SelfStyle.outputPanel}>
                <div className={SelfStyle.outputHeader}>
                  <span>输出 {statusTag()}</span>
                  {currentTaskId && (
                    <span style={{ fontSize: 11, color: "#999" }}>任务 #{currentTaskId}</span>
                  )}
                </div>
                <div className={SelfStyle.terminal} ref={terminalRef}>
                  {taskLogs.length === 0 ? (
                    <span style={{ color: "#666" }}>点击执行按钮后在此显示日志…</span>
                  ) : (
                    taskLogs.map((log, i) => (
                      <div key={i} className={log.level === "error" ? SelfStyle.logError : SelfStyle.logInfo}>
                        <span className={SelfStyle.logTime}>
                          {new Date(log.time).toLocaleTimeString()}
                        </span>
                        {log.text.split("\n").map((line, j) => (
                          <div key={j}>{line}</div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
                {executions.length > 0 && (
                  <div className={SelfStyle.historyList}>
                    <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>最近执行</div>
                    {executions.slice(0, 8).map((ex) => (
                      <div key={ex.id + ex.startTime} className={SelfStyle.historyItem}>
                        <Tag
                          color={ex.status === "success" ? "green" : ex.status === "failed" ? "red" : "blue"}
                          style={{ marginRight: 6 }}
                        >
                          {ex.status === "success" ? "成功" : ex.status === "failed" ? "失败" : "运行中"}
                        </Tag>
                        {ex.scriptName} · {new Date(ex.startTime).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={SelfStyle.emptyState}>请选择脚本</div>
          )}
        </section>
      </div>
      <ScriptEditorModal ref={editorRef} onSaved={loadData} />
    </div>
  );
};

export default PScript;
