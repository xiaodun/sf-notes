import NAuthor from "./NAuthor";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export namespace SAuthor {
  /**
   * 获取作者列表
   * @param params 查询参数（支持按作者名、朝代ID搜索）
   */
  export async function getList(params?: {
    name?: string;
    dynastyId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<NRsp<NAuthor>> {
    return request({
      url: "/classics/getAuthorList",
      params,
    });
  }

  /**
   * 添加作者
   */
  export async function addItem(
    author: Omit<NAuthor, "id" | "createTime" | "updateTime">
  ): Promise<NRsp<NAuthor>> {
    return request({
      url: "/classics/addAuthor",
      method: "post",
      data: author,
    });
  }

  /**
   * 编辑作者
   */
  export async function editItem(author: NAuthor): Promise<NRsp> {
    return request({
      url: "/classics/editAuthor",
      method: "post",
      data: author,
    });
  }

  /**
   * 删除作者
   */
  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: "/classics/delAuthor",
      params: {
        id,
      },
    });
  }
}

export default SAuthor;
