import NDynasty from "./NDynasty";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export namespace SDynasty {
  /**
   * 获取朝代列表
   * @param params 查询参数（支持按朝代名搜索）
   */
  export async function getList(params?: {
    name?: string;
    page?: number;
    pageSize?: number;
  }): Promise<NRsp<NDynasty>> {
    return request({
      url: "/classics/getDynastyList",
      params,
    });
  }

  /**
   * 添加朝代
   */
  export async function addItem(
    dynasty: Omit<NDynasty, "id" | "createTime" | "updateTime">
  ): Promise<NRsp<NDynasty>> {
    return request({
      url: "/classics/addDynasty",
      method: "post",
      data: dynasty,
    });
  }

  /**
   * 编辑朝代
   */
  export async function editItem(dynasty: NDynasty): Promise<NRsp> {
    return request({
      url: "/classics/editDynasty",
      method: "post",
      data: dynasty,
    });
  }

  /**
   * 删除朝代
   */
  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: "/classics/delDynasty",
      params: {
        id,
      },
    });
  }
}

export default SDynasty;
