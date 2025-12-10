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
 * 中奖信息
 */
export interface IPrizeInfo {
  /**
   * 中奖等级（1-9，0表示未中奖）
   */
  level: number;
  /**
   * 中奖等级名称
   */
  levelName: string;
  /**
   * 奖金金额（元，可能为空）
   */
  bonus?: number;
}

/**
 * 号码匹配结果
 */
export interface IMatchResult {
  /**
   * 号码组合
   */
  numbers: ILotteryNumbers;
  /**
   * 是否为固定号码
   */
  isFixed: boolean;
  /**
   * 投注金额
   */
  betAmount?: number;
  /**
   * 中奖信息
   */
  prizeInfo?: IPrizeInfo;
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
  /**
   * 开奖日期（YYYY-MM-DD格式）
   */
  drawDate?: string;
  /**
   * 中奖号码（开奖后填充）
   */
  winningNumbers?: ILotteryNumbers;
}

export default NLottery;
