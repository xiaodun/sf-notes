import NRsp from "@/common/namespace/NRsp";
import NFootball from "./NFootball";
import request from "@/utils/request";

namespace SFootball {
  export async function getConfig(): Promise<NRsp<NFootball.IConfig>> {
    return request({
      url: "/football/getConfig",
      method: "get",
    });
  }
  export async function getFootballList(): Promise<NRsp<NFootball>> {
    return request({
      url: "/football/getFootballList",
    })
  }
}
export default SFootball;