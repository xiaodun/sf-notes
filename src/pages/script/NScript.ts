export interface ScriptParamDef {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}

export interface CustomScript {
  id: string;
  name: string;
  description?: string;
  command: string;
  params: ScriptParamDef[];
  createTime: number;
  updateTime: string;
}

export interface DeviceProfile {
  id: string;
  name: string;
  address: string;
  pairPort?: string;
  connectPort?: string;
  updateTime?: string;
}

export interface ExecutionRecord {
  id: string;
  scriptId: string;
  scriptName: string;
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

export type ScriptKind = "builtin" | "custom";

export type AdbExecMode = "pair" | "connect";

export interface ScriptItem {
  id: string;
  name: string;
  description?: string;
  kind: ScriptKind;
  builtinKey?: string;
  params: ScriptParamDef[];
  command?: string;
}

namespace NScript {
  export const ADB_WIRELESS_ID = "builtin:adb-wireless";

  export const BUILTIN_SCRIPTS: ScriptItem[] = [
    {
      id: ADB_WIRELESS_ID,
      name: "ADB 无线连接",
      description: "无线调试连接：首次需配对，已配对可直接连接",
      kind: "builtin",
      builtinKey: "adb-wireless",
      params: [
        { key: "address", label: "设备地址", placeholder: "192.168.1.100", required: true },
        { key: "connectPort", label: "连接端口", placeholder: "无线调试界面显示的连接端口", required: true },
        { key: "pairPort", label: "配对端口", placeholder: "配对并连接时填写" },
        { key: "pairCode", label: "配对码", placeholder: "6 位数字，配对并连接时填写" },
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

  export function customToScriptItem(script: CustomScript): ScriptItem {
    return {
      id: script.id,
      name: script.name,
      description: script.description,
      kind: "custom",
      command: script.command,
      params: script.params || [],
    };
  }
}

export default NScript;
