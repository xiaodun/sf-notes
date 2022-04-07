import NRsp from "@/common/namespace/NRsp";
import NIterative from "./NIterative";
import request from "@/utils/request";

namespace SIterative {
  export async function getConfig(): Promise<NRsp<NIterative.IConfig>> {
    return request({
      url: "/iterative/getConfig",
      method: "get",
    });
  }
  export async function getIterativeList(): Promise<NRsp<NIterative>> {
    return request({
      url: "/iterative/getIterativeList",
    })
  }
}
export default SIterative;