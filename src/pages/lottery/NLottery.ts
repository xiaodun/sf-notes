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
 * 固定号码（包含投注金额）
 */
export interface IFixedNumber {
  /**
   * 号码组合
   */
  numbers: ILotteryNumbers;
  /**
   * 投注金额（元，整数）
   */
  betAmount: number;
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
  /**
   * 固定号码列表（每场预测通用，全局配置）
   */
  fixedNumbers?: ILotteryNumbers[];
  /**
   * 投注金额（元，整数）
   */
  betAmount?: number;
}

export default NLottery;
