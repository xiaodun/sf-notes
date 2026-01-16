import NBehavior from "./NBehavior";
import NBehaviorRecord from "./NBehaviorRecord";
import NBehaviorTag from "./NBehaviorTag";

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

  export async function getItem(id: string): Promise<NRsp<NBehavior>> {
    return request({
      url: "/behavior/getBehavior",
      params: { id },
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

  export async function editItem(behavior: NBehavior): Promise<NRsp> {
    return request({
      url: "/behavior/editBehavior",
      method: "post",
      data: behavior,
    });
  }

  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: "/behavior/delBehavior",
      params: { id },
    });
  }

  export async function addRecord(record: NBehaviorRecord): Promise<NRsp<NBehaviorRecord>> {
    return request({
      url: "/behavior/addRecord",
      method: "post",
      data: record,
    });
  }

  export async function getRecords(behaviorId: string): Promise<NRsp<NBehaviorRecord>> {
    return request({
      url: "/behavior/getRecords",
      params: { behaviorId },
    });
  }

  export async function editRecord(record: NBehaviorRecord): Promise<NRsp> {
    return request({
      url: "/behavior/editRecord",
      method: "post",
      data: record,
    });
  }

  export async function delRecord(id: string): Promise<NRsp> {
    return request({
      url: "/behavior/delRecord",
      params: { id },
    });
  }

  export async function getGlobalTags(): Promise<NRsp<NBehaviorTag>> {
    return request({
      url: "/behavior/getGlobalTags",
    });
  }

  export async function getBehaviorTags(behaviorId: string): Promise<NRsp<NBehaviorTag>> {
    return request({
      url: "/behavior/getBehaviorTags",
      params: { behaviorId },
    });
  }

  export async function addTag(tag: NBehaviorTag): Promise<NRsp<NBehaviorTag>> {
    return request({
      url: "/behavior/addTag",
      method: "post",
      data: tag,
    });
  }

  export async function editTag(tag: NBehaviorTag): Promise<NRsp> {
    return request({
      url: "/behavior/editTag",
      method: "post",
      data: tag,
    });
  }

  export async function delTag(id: string): Promise<NRsp> {
    return request({
      url: "/behavior/delTag",
      params: { id },
    });
  }
}

export default SBehavior;

