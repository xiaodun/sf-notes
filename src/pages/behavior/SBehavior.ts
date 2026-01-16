import NBehavior from "./NBehavior";

import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export namespace SBehavior {
  export async function getList(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<NRsp<NBehavior>> {
    return request({
      url: "/behavior/getBehaviorList",
      params,
    });
  }

  export async function addItem(
    behavior: NBehavior,
    index: number = 0
  ): Promise<NRsp<NBehavior>> {
    return request({
      url: "/behavior/addBehavior",
      method: "post",
      data: {
        behavior,
        index,
      },
    });
  }
}

export default SBehavior;

