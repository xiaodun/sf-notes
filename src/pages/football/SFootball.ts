import NRsp from "@/common/namespace/NRsp";
import NFootball from "./NFootball";
import request from "@/utils/request";
import NModel from "@/common/namespace/NModel";
import { NMDFootball } from "umi";

namespace SFootball {
  export async function getTeamOddList(id: string) {
    return request({
      url: "/football/getTeamOddList",
      method: "post",
      data: {
        id,
      },
    }).then((rsp: NRsp<NFootball.ITeamRecordOdds>) => {
      NModel.dispatch(new NMDFootball.ARSetState({ teamOddList: rsp.list }));
      return rsp;
    });
  }
  export async function saveTeamOdds(
    id: string,
    teamOdds: NFootball.ITeamRecordOdds
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/football/saveTeamOdds",
      method: "post",
      data: {
        id,
        teamOdds,
      },
    });
  }
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
