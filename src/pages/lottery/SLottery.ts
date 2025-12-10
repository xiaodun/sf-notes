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

  /**
   * 获取全局固定号码
   */
  export async function getFixedNumbers(): Promise<
    NRsp<import("./NLottery").IFixedNumber[]>
  > {
    return request({
      url: "/lottery/getFixedNumbers",
      method: "get",
    });
  }

  /**
   * 保存全局固定号码
   */
  export async function saveFixedNumbers(
    data: import("./NLottery").IFixedNumber[]
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/lottery/saveFixedNumbers",
      method: "post",
      data,
    });
  }

  /**
   * 获取大乐透配置
   */
  export async function getLotteryConfig(): Promise<
    NRsp<{ includeFixedNumbers: boolean }>
  > {
    return request({
      url: "/lottery/getLotteryConfig",
      method: "get",
    });
  }

  /**
   * 保存大乐透配置
   */
  export async function saveLotteryConfig(data: {
    includeFixedNumbers: boolean;
  }): Promise<NRsp<boolean>> {
    return request({
      url: "/lottery/saveLotteryConfig",
      method: "post",
      data,
    });
  }

  /**
   * 获取中奖号码
   */
  export async function getWinningNumbers(
    drawDate: string
  ): Promise<NRsp<import("./NLottery").ILotteryNumbers>> {
    return request({
      url: "/lottery/getWinningNumbers",
      method: "get",
      params: { drawDate },
    });
  }
}

export default SLottery;
