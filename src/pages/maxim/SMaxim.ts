import NMaxim from "./NMaxim";

import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export namespace SMaxim {
  export async function getList(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<NRsp<NMaxim>> {
    return request({
      url: "/maxim/getMaximList",
      params,
    });
  }

  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: "/maxim/delMaxim",
      params: {
        id,
      },
    });
  }

  export async function addItem(
    maxim: NMaxim,
    index: number = 0
  ): Promise<NRsp<NMaxim>> {
    return request({
      url: "/maxim/addMaxim",
      method: "post",
      data: {
        maxim,
        index,
      },
    });
  }

  export async function editItem(maxim: NMaxim): Promise<NRsp> {
    return request({
      url: "/maxim/editMaxim",
      method: "post",
      data: maxim,
    });
  }
}

export default SMaxim;
