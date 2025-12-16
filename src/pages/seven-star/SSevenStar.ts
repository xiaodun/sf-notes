import NRsp from "@/common/namespace/NRsp";
import NSevenStar from "./NSevenStar";
import request from "@/utils/request";

namespace SSevenStar {
  /**
   * 获取预测列表
   */
  export async function getSevenStarList(): Promise<NRsp<NSevenStar[]>> {
    return request({
      url: "/seven-star/getSevenStarList",
      method: "get",
    });
  }

  /**
   * 添加预测
   */
  export async function addSevenStar(
    data: Omit<NSevenStar, "id" | "createTime" | "updateTime">
  ): Promise<NRsp<NSevenStar>> {
    return request({
      url: "/seven-star/addSevenStar",
      method: "post",
      data,
    });
  }

  /**
   * 编辑预测
   */
  export async function editSevenStar(
    data: NSevenStar
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/seven-star/editSevenStar",
      method: "post",
      data,
    });
  }

  /**
   * 删除预测
   */
  export async function delSevenStar(id: string): Promise<NRsp<boolean>> {
    return request({
      url: "/seven-star/delSevenStar",
      method: "post",
      data: { id },
    });
  }

  /**
   * 获取全局固定号码
   */
  export async function getFixedNumbers(): Promise<
    NRsp<import("./NSevenStar").IFixedNumber[]>
  > {
    return request({
      url: "/seven-star/getFixedNumbers",
      method: "get",
    });
  }

  /**
   * 保存全局固定号码
   */
  export async function saveFixedNumbers(
    data: import("./NSevenStar").IFixedNumber[]
  ): Promise<NRsp<boolean>> {
    return request({
      url: "/seven-star/saveFixedNumbers",
      method: "post",
      data,
    });
  }

  /**
   * 获取七星彩配置
   */
  export async function getSevenStarConfig(): Promise<
    NRsp<{ includeFixedNumbers: boolean }>
  > {
    return request({
      url: "/seven-star/getSevenStarConfig",
      method: "get",
    });
  }

  /**
   * 保存七星彩配置
   */
  export async function saveSevenStarConfig(data: {
    includeFixedNumbers: boolean;
  }): Promise<NRsp<boolean>> {
    return request({
      url: "/seven-star/saveSevenStarConfig",
      method: "post",
      data,
    });
  }

  /**
   * 获取中奖号码
   */
  export async function getWinningNumbers(
    drawDate: string
  ): Promise<NRsp<import("./NSevenStar").ISevenStarNumbers>> {
    return request({
      url: "/seven-star/getWinningNumbers",
      method: "get",
      params: { drawDate },
    });
  }
}

export default SSevenStar;
