import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";
import {
  DeviceProfile,
  ExecutionRecord,
  ScriptTaskStatus,
} from "./NScript";

export namespace SScript {
  export async function getList(): Promise<
    NRsp<{
      devices: DeviceProfile[];
      executions: ExecutionRecord[];
    }>
  > {
    return request({ url: "/script/getList" });
  }

  export async function saveDevice(device: Partial<DeviceProfile>): Promise<NRsp<DeviceProfile>> {
    return request({
      url: "/script/saveDevice",
      method: "post",
      data: { device },
    });
  }

  export async function delDevice(id: string): Promise<NRsp> {
    return request({
      url: "/script/delDevice",
      params: { id },
    });
  }

  export async function executeScript(payload: {
    scriptId: string;
    scriptName: string;
    deviceId?: string;
    action?: string;
    builtinKey?: string;
    params: Record<string, string>;
  }): Promise<NRsp<{ taskId: string }>> {
    return request({
      url: "/script/executeScript",
      method: "post",
      data: payload,
    });
  }

  export async function getTaskStatus(taskId: string): Promise<NRsp<ScriptTaskStatus>> {
    return request({
      url: "/script/getTaskStatus",
      params: { taskId },
    });
  }

  export async function saveExecution(taskId: string): Promise<NRsp> {
    return request({
      url: "/script/saveExecution",
      method: "post",
      data: { taskId },
    });
  }
}

export default SScript;
