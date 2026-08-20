import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Input,
  message,
  Tag,
} from "antd";
import {
  CaretRightOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import SelfStyle from "./LScript.less";
import SScript from "./SScript";
import NScript, {
  AdbExecMode,
  DeviceProfile,
  ExecutionRecord,
  ScriptItem,
  ScriptParamDef,
  ScriptTaskStatus,
  TaskLog,
} from "./NScript";

const LS_KEY = "script_last_params";
const SAVE_DEBOUNCE = 400;

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

function deviceValues(device: DeviceProfile): Record<string, string> {
  return {
    address: device.address || "",
    pairPort: device.pairPort || "",
    pairCode: device.pairCode || "",
    connectPort: device.connectPort || "",
  };
}

const PScript: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const pollTimerRef = useRef<number | null>(null);
  const pollInFlightRef = useRef(false);
  const pollSettledRef = useRef(false);
  const persistTimersRef = useRef<Record<string, number>>({});
  const savedDevicesRef = useRef<Record<string, DeviceProfile>>({});

  const [devices, setDevices] = useState<DeviceProfile[]>([]);
  const [executions, setExecutions] = useState<ExecutionRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>(NScript.BUILTIN_SCRIPTS[0].id);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [runningDeviceId, setRunningDeviceId] = useState<string | null>(null);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);
  const [taskStatus, setTaskStatus] = useState<ScriptTaskStatus["status"] | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [addingDevice, setAddingDevice] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const allScripts = NScript.BUILTIN_SCRIPTS;

  const selectedScript = useMemo<ScriptItem | undefined>(
    () => allScripts.find((s) => s.id === selectedId) || allScripts[0],
    [allScripts, selectedId]
  );

  const isAdbScript = selectedScript?.builtinKey === "adb-wireless";

  const scriptDevices = useMemo(() => {
    if (!selectedScript) return [];
    return devices.filter((d) => {
      if (d.scriptId) return d.scriptId === selectedScript.id;
      return selectedScript.builtinKey === "adb-wireless";
    });
  }, [devices, selectedScript]);

  const loadData = useCallback(async () => {
    const rsp = await SScript.getList();
    if (rsp.success && rsp.data) {
      const list = rsp.data.devices || [];
      setDevices(list);
      list.forEach((d) => {
        savedDevicesRef.current[d.id] = d;
      });
      setExecutions(rsp.data.executions || []);
    }
  }, []);

  const loadExecutions = useCallback(async () => {
    const rsp = await SScript.getList();
    if (rsp.success && rsp.data) {
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
    setAddingDevice(false);
    setNewDeviceName("");
    setEditingNameId(null);
    setEditingName("");
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

  const clearPersistTimer = (id: string) => {
    if (persistTimersRef.current[id]) {
      window.clearTimeout(persistTimersRef.current[id]);
      delete persistTimersRef.current[id];
    }
  };

  useEffect(
    () => () => {
      stopPolling();
      Object.keys(persistTimersRef.current).forEach(clearPersistTimer);
    },
    []
  );

  const persistDevice = (device: DeviceProfile) => {
    if (!device.name.trim()) return;
    clearPersistTimer(device.id);
    persistTimersRef.current[device.id] = window.setTimeout(async () => {
      const rsp = await SScript.saveDevice(device);
      if (rsp.success && rsp.data) {
        savedDevicesRef.current[rsp.data.id] = rsp.data;
      } else {
        message.error(rsp.message || "保存失败");
      }
    }, SAVE_DEBOUNCE);
  };

  const patchDevice = (id: string, patch: Partial<DeviceProfile>) => {
    setDevices((prev) => {
      const next = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      const updated = next.find((d) => d.id === id);
      if (updated) persistDevice(updated);
      return next;
    });
  };

  const isNameTaken = (name: string, exceptId?: string) => {
    const trimmed = name.trim();
    return scriptDevices.some((d) => d.id !== exceptId && d.name.trim() === trimmed);
  };

  const pollTask = (taskId: string) => {
    stopPolling();
    pollInFlightRef.current = false;
    pollSettledRef.current = false;

    const finishOnce = async (task: ScriptTaskStatus) => {
      if (pollSettledRef.current) return;
      pollSettledRef.current = true;
      stopPolling();
      setRunning(false);
      setRunningDeviceId(null);
      setTaskLogs(task.logs || []);
      setTaskStatus(task.status === "missing" ? "failed" : task.status);

      if (task.status === "missing") return;

      await SScript.saveExecution(taskId);
      loadExecutions();
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

  const handleExecuteDevice = async (device: DeviceProfile, adbMode: AdbExecMode) => {
    if (!selectedScript) return;

    const err = NScript.adbValidate(adbMode, deviceValues(device));
    if (err) {
      message.warning(err);
      return;
    }

    setRunning(true);
    setRunningDeviceId(device.id);
    setTaskLogs([]);
    setTaskStatus("running");
    setCurrentTaskId(null);

    const actionLabel = adbMode === "pair" ? "配对并连接" : "直接连接";

    const rsp = await SScript.executeScript({
      scriptId: selectedScript.id,
      scriptName: `${selectedScript.name} · ${device.name} · ${actionLabel}`,
      deviceId: device.id,
      action: actionLabel,
      builtinKey: selectedScript.builtinKey,
      params: { ...deviceValues(device), mode: adbMode },
    });

    if (!rsp.success || !rsp.data?.taskId) {
      setRunning(false);
      setRunningDeviceId(null);
      message.error(rsp.message || "启动失败");
      return;
    }

    setCurrentTaskId(rsp.data.taskId);
    pollTask(rsp.data.taskId);
  };

  const handleExecute = async (adbMode: AdbExecMode) => {
    if (!selectedScript) return;

    const err = NScript.adbValidate(adbMode, paramValues);
    if (err) {
      message.warning(err);
      return;
    }

    saveParams(selectedScript.id, paramValues);
    setRunning(true);
    setTaskLogs([]);
    setTaskStatus("running");
    setCurrentTaskId(null);

    const actionLabel = adbMode === "pair" ? "配对并连接" : "直接连接";

    const rsp = await SScript.executeScript({
      scriptId: selectedScript.id,
      scriptName: `${selectedScript.name} · ${actionLabel}`,
      builtinKey: selectedScript.builtinKey,
      params: { ...paramValues, mode: adbMode },
    });

    if (!rsp.success || !rsp.data?.taskId) {
      setRunning(false);
      message.error(rsp.message || "启动失败");
      return;
    }

    setCurrentTaskId(rsp.data.taskId);
    pollTask(rsp.data.taskId);
  };

  const handleConfirmAddDevice = async () => {
    if (!selectedScript) return;
    const name = newDeviceName.trim();
    if (!name) {
      message.warning("请填写设备名称");
      return;
    }
    if (isNameTaken(name)) {
      message.warning("设备名称已存在");
      return;
    }

    const rsp = await SScript.saveDevice({
      scriptId: selectedScript.id,
      name,
      address: "",
      pairPort: "",
      pairCode: "",
      connectPort: "",
    });
    if (!rsp.success || !rsp.data) {
      message.error(rsp.message || "添加失败");
      return;
    }

    savedDevicesRef.current[rsp.data.id] = rsp.data;
    setDevices((prev) => [rsp.data as DeviceProfile, ...prev]);
    setExpandedIds((prev) => [rsp.data!.id, ...prev.filter((id) => id !== rsp.data!.id)]);
    setAddingDevice(false);
    setNewDeviceName("");
  };

  const startEditName = (device: DeviceProfile) => {
    setEditingNameId(device.id);
    setEditingName(device.name);
  };

  const finishEditName = (device: DeviceProfile) => {
    if (editingNameId !== device.id) return;
    const name = editingName.trim();
    setEditingNameId(null);
    setEditingName("");
    if (!name || name === device.name) return;
    if (isNameTaken(name, device.id)) {
      message.warning("设备名称已存在");
      return;
    }
    patchDevice(device.id, { name });
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteDevice = async (id: string) => {
    clearPersistTimer(id);
    const rsp = await SScript.delDevice(id);
    if (rsp.success) {
      delete savedDevicesRef.current[id];
      setDevices((prev) => prev.filter((d) => d.id !== id));
      setExecutions((prev) => prev.filter((ex) => ex.deviceId !== id));
      setExpandedIds((prev) => prev.filter((x) => x !== id));
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

  const renderDeviceField = (device: DeviceProfile, p: ScriptParamDef) => (
    <div key={p.key} className={SelfStyle.paramField}>
      <label className={SelfStyle.paramLabel}>{p.label}</label>
      <Input
        value={(device as unknown as Record<string, string>)[p.key] || ""}
        placeholder={p.placeholder}
        onChange={(e) => patchDevice(device.id, { [p.key]: e.target.value })}
        disabled={running}
      />
    </div>
  );

  const renderAdbDevices = () => (
    <>
      {addingDevice ? (
        <div className={SelfStyle.addDeviceRow}>
          <Input
            autoFocus
            value={newDeviceName}
            onChange={(e) => setNewDeviceName(e.target.value)}
            onPressEnter={handleConfirmAddDevice}
            disabled={running}
          />
          <Button type="primary" onClick={handleConfirmAddDevice} disabled={running}>
            确定
          </Button>
          <Button
            onClick={() => {
              setAddingDevice(false);
              setNewDeviceName("");
            }}
            disabled={running}
          >
            取消
          </Button>
        </div>
      ) : (
        <div className={SelfStyle.deviceToolbar}>
          <Button icon={<PlusOutlined />} onClick={() => setAddingDevice(true)} disabled={running}>
            添加设备
          </Button>
        </div>
      )}

      {scriptDevices.map((device) => {
        const expanded = expandedIds.includes(device.id);
        const deviceExecs = executions.filter((ex) => ex.deviceId === device.id).slice(0, 8);
        return (
          <div key={device.id} className={SelfStyle.deviceCard}>
            <div className={SelfStyle.deviceHeader} onClick={() => toggleExpand(device.id)}>
              <CaretRightOutlined
                className={`${SelfStyle.deviceCaret} ${expanded ? SelfStyle.deviceCaretOpen : ""}`}
              />
              <div className={SelfStyle.deviceTitle}>
                {editingNameId === device.id ? (
                  <Input
                    autoFocus
                    size="small"
                    className={SelfStyle.deviceNameInput}
                    value={editingName}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setEditingName(e.target.value)}
                    onPressEnter={() => finishEditName(device)}
                    onBlur={() => finishEditName(device)}
                    disabled={running}
                  />
                ) : (
                  <>
                    <span className={SelfStyle.deviceHeaderName}>{device.name}</span>
                    <EditOutlined
                      className={SelfStyle.deviceEdit}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!running) startEditName(device);
                      }}
                    />
                  </>
                )}
              </div>
              <DeleteOutlined
                className={SelfStyle.deviceDel}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDevice(device.id);
                }}
              />
            </div>
            {expanded && selectedScript && (
              <div className={SelfStyle.deviceBody}>
                <div className={SelfStyle.paramGrid}>
                  {selectedScript.params
                    .filter((p) => p.key !== "connectPort")
                    .map((p) => renderDeviceField(device, p))}
                </div>
                <div className={SelfStyle.paramSolo}>
                  {selectedScript.params
                    .filter((p) => p.key === "connectPort")
                    .map((p) => renderDeviceField(device, p))}
                </div>
                <div className={SelfStyle.actionBar}>
                  <Button
                    type="primary"
                    icon={<CaretRightOutlined />}
                    loading={running && runningDeviceId === device.id}
                    disabled={running && runningDeviceId !== device.id}
                    onClick={() => handleExecuteDevice(device, "connect")}
                  >
                    直接连接
                  </Button>
                  <Button
                    loading={running && runningDeviceId === device.id}
                    disabled={running && runningDeviceId !== device.id}
                    onClick={() => handleExecuteDevice(device, "pair")}
                  >
                    配对并连接
                  </Button>
                </div>
                {deviceExecs.length > 0 && (
                  <div className={SelfStyle.deviceHistory}>
                    {deviceExecs.map((ex) => (
                      <div key={ex.id + ex.startTime} className={SelfStyle.historyItem}>
                        <Tag
                          color={ex.status === "success" ? "green" : ex.status === "failed" ? "red" : "blue"}
                          style={{ marginRight: 6 }}
                        >
                          {ex.status === "success" ? "成功" : ex.status === "failed" ? "失败" : "运行中"}
                        </Tag>
                        {ex.action || ex.scriptName} · {new Date(ex.startTime).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  return (
    <div className={SelfStyle.pageRoot}>
      <div className={SelfStyle.main}>
        <aside className={SelfStyle.sidebar}>
          {NScript.BUILTIN_SCRIPTS.map((item) => (
            <div
              key={item.id}
              className={`${SelfStyle.scriptItem} ${selectedId === item.id ? SelfStyle.active : ""}`}
              onClick={() => setSelectedId(item.id)}
            >
              <div className={SelfStyle.scriptName}>{item.name}</div>
            </div>
          ))}
        </aside>

        <section className={SelfStyle.content}>
          {selectedScript ? (
            <>
              {selectedScript.description && (
                <div className={SelfStyle.contentHeader}>
                  <p className={SelfStyle.desc}>{selectedScript.description}</p>
                </div>
              )}

              <div className={SelfStyle.formArea}>
                {isAdbScript ? (
                  renderAdbDevices()
                ) : (
                  <>
                    <div className={SelfStyle.paramGrid}>
                      {selectedScript.params.map(renderParamInput)}
                    </div>
                    <div className={SelfStyle.actionBar}>
                      <Button
                        type="primary"
                        icon={<CaretRightOutlined />}
                        loading={running}
                        onClick={() => handleExecute("connect")}
                      >
                        执行
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className={SelfStyle.outputPanel}>
                <div className={SelfStyle.outputHeader}>
                  <span>输出 {statusTag()}</span>
                  <Button
                    size="small"
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
              </div>
            </>
          ) : (
            <div className={SelfStyle.emptyState}>请选择脚本</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default PScript;
