import NRsp from "@/common/namespace/NRsp";
import NFootball from "./NFootball";
import request from "@/utils/request";
import NModel from "@/common/namespace/NModel";
import { NMDFootball } from "umi";

namespace SFootball {
  export async function createPredict(data: NFootball): Promise<NRsp<boolean>> {
    return request({
      url: "/football/createPredict",
      method: "post",
      data,
    });
  }
  export async function getPredictList() {
    return request({
      url: "/football/getPredictList",
      method: "post",
    }).then((rsp: NRsp<NFootball>) => {
      NModel.dispatch(new NMDFootball.ARSetState({ rsp }));
      return rsp;
    });
  }
  export async function getConfig(): Promise<NRsp<NFootball.IConfig>> {
    return request({
      url: "/football/getConfig",
      method: "get",
    });
  }
}
export default SFootball;
