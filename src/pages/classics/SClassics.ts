import NClassics from "./NClassics";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export namespace SClassics {
  /**
   * 获取名篇列表
   * @param params 查询参数（支持按作者、朝代搜索和分页）
   */
  export async function getList(params?: {
    authorId?: string;
    dynastyId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<NRsp<NClassics>> {
    return request({
      url: "/classics/getClassicsList",
      params,
    });
  }

  /**
   * 添加名篇
   */
  export async function addItem(
    classic: Omit<NClassics, "id" | "createTime" | "updateTime">,
    index: number = 0
  ): Promise<NRsp<NClassics>> {
    return request({
      url: "/classics/addClassic",
      method: "post",
      data: {
        classic,
        index,
      },
    });
  }

  /**
   * 编辑名篇
   */
  export async function editItem(classic: NClassics): Promise<NRsp> {
    return request({
      url: "/classics/editClassic",
      method: "post",
      data: classic,
    });
  }

  /**
   * 删除名篇
   */
  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: "/classics/delClassic",
      params: {
        id,
      },
    });
  }
}

export default SClassics;
