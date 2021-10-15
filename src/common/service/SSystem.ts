import NRsp from "@/common/namespace/NRsp";
import request from "@/utils/request";
import { NSystem } from "../namespace/NSystem";

namespace SSystem {
  export async function getFileDirectory(
    path?: string
  ): Promise<NRsp<NSystem.IDirectory>> {
    return request({
      url: "/system/getFileDirectory",
      method: "post",
      data: {
        path,
      },
    });
  }
  export async function usedPort(port: number): Promise<NRsp<boolean>> {
    return request({
      url: "/system/usedPort",
      method: "post",
      data: {
        port,
      },
    });
  }
  export async function startBat(path?: string): Promise<NRsp<boolean>> {
    return request({
      url: "/system/startBat",
      method: "post",
      data: {
        path,
      },
    });
  }
}

export default SSystem;
