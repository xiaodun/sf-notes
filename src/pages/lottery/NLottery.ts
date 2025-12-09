/**
 * 大乐透号码组合
 */
export interface ILotteryNumbers {
  /**
   * 前区号码（1-35，5个）
   */
  front: number[];
  /**
   * 后区号码（1-12，2个）
   */
  back: number[];
}

/**
 * 大乐透预测
 */
export interface NLottery {
  /**
   * 预测ID
   */
  id: string;
  /**
   * 预测名称
   */
  name: string;
  /**
   * 创建时间
   */
  createTime: number;
  /**
   * 更新时间
   */
  updateTime: string;
  /**
   * 号码组合列表
   */
  numbersList: ILotteryNumbers[];
}

export default NLottery;
