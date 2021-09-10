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
}

export default SSystem;
