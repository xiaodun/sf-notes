export interface ScriptParamDef {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface DeviceProfile {
  id: string;
  scriptId: string;
  name: string;
  address: string;
  pairPort?: string;
  pairCode?: string;
  connectPort?: string;
  updateTime?: string;
}

export interface ExecutionRecord {
  id: string;
  scriptId: string;
  scriptName: string;
  deviceId?: string;
  action?: string;
  status: "running" | "success" | "failed";
  message?: string;
  startTime: number;
  endTime?: number;
  logs?: TaskLog[];
}

export interface TaskLog {
  time: number;
  level: "info" | "error";
  text: string;
}

export interface ScriptTaskStatus {
  id: string;
  status: "running" | "success" | "failed" | "missing";
  logs: TaskLog[];
  steps: { label: string; ok: boolean; output: string }[];
  message: string;
  startTime: number;
  endTime: number | null;
  scriptId?: string;
  scriptName?: string;
}

export type AdbExecMode = "pair" | "connect";

export interface ScriptItem {
  id: string;
  name: string;
  description?: string;
  builtinKey?: string;
  params: ScriptParamDef[];
}

namespace NScript {
  export const ADB_WIRELESS_ID = "builtin:adb-wireless";

  export const BUILTIN_SCRIPTS: ScriptItem[] = [
    {
      id: ADB_WIRELESS_ID,
      name: "ADB 无线连接",
      description: "无线调试连接：首次需配对，已配对可直接连接",
      builtinKey: "adb-wireless",
      params: [
        { key: "address", label: "设备地址", placeholder: "192.168.1.100", required: true },
        { key: "pairPort", label: "配对端口" },
        { key: "pairCode", label: "配对码" },
        { key: "connectPort", label: "连接端口", required: true },
      ],
    },
  ];

  export function adbValidate(mode: AdbExecMode, values: Record<string, string>): string | null {
    if (!String(values.address || "").trim()) return "请填写设备地址";
    if (!String(values.connectPort || "").trim()) return "请填写连接端口";
    if (mode === "pair") {
      if (!String(values.pairPort || "").trim()) return "请填写配对端口";
      if (!/^\d{6}$/.test(String(values.pairCode || "").trim())) return "配对码须为 6 位数字";
    }
    return null;
  }
}

export default NScript;
