import NNovel from "./NNovel";

import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export namespace SNovel {
  export async function getList(params?: {
    page?: number;
    pageSize?: number;
  }): Promise<NRsp<NNovel>> {
    return request({
      url: "/novel/getNovelList",
      params,
    });
  }

  export async function getItem(id: string): Promise<NRsp<NNovel>> {
    return request({
      url: "/novel/getNovel",
      params: { id },
    });
  }

  export async function addItem(
    novel: NNovel,
    index: number = 0
  ): Promise<NRsp<NNovel>> {
    return request({
      url: "/novel/addNovel",
      method: "post",
      data: { ...novel, index },
    });
  }

  export async function editItem(
    novel: NNovel
  ): Promise<NRsp<NNovel>> {
    return request({
      url: "/novel/editNovel",
      method: "post",
      data: novel,
    });
  }

  export async function delItem(id: string): Promise<NRsp<NNovel>> {
    return request({
      url: "/novel/delNovel",
      method: "post",
      data: { id },
    });
  }
}

export default SNovel;

