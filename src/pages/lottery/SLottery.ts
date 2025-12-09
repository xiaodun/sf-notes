import NRsp from "@/common/namespace/NRsp";
import NLottery from "./NLottery";
import request from "@/utils/request";

namespace SLottery {
  /**
   * 获取预测列表
   */
  export async function getLotteryList(): Promise<NRsp<NLottery[]>> {
    return request({
      url: "/lottery/getLotteryList",
      method: "get",
    });
  }

  /**
   * 添加预测
   */
  export async function addLottery(
    data: Omit<NLottery, "id" | "createTime" | "updateTime">
  ): Promise<NRsp<NLottery>> {
    return request({
      url: "/lottery/addLottery",
      method: "post",
      data,
    });
  }

  /**
   * 编辑预测
   */
  export async function editLottery(data: NLottery): Promise<NRsp<boolean>> {
    return request({
      url: "/lottery/editLottery",
      method: "post",
      data,
    });
  }

  /**
   * 删除预测
   */
  export async function delLottery(id: string): Promise<NRsp<boolean>> {
    return request({
      url: "/lottery/delLottery",
      method: "post",
      data: { id },
    });
  }
}

export default SLottery;
