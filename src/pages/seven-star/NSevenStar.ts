/**
 * 七星彩号码组合（2020年规则升级后）
 * 前6位数字：0-9
 * 最后1位（后区）：0-14
 */
export interface ISevenStarNumbers {
  /**
   * 7位数字数组
   * 前6位：0-9
   * 最后1位（后区）：0-14
   */
  numbers: number[];
}

/**
 * 固定号码（包含投注金额）
 */
export interface IFixedNumber {
  /**
   * 号码组合
   */
  numbers: ISevenStarNumbers;
  /**
   * 投注金额（元，整数）
   */
  betAmount: number;
  /**
   * 是否启用投注（默认 true，取消投注时为 false，但金额保持不变）
   */
  isEnabled?: boolean;
}

/**
 * 中奖信息
 */
export interface IPrizeInfo {
  /**
   * 中奖等级（1-6，0表示未中奖）
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
  numbers: ISevenStarNumbers;
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
 * 七星彩预测
 */
export interface NSevenStar {
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
  numbersList: ISevenStarNumbers[];
  /**
   * 固定号码列表（每场预测通用，全局配置）
   */
  fixedNumbers?: ISevenStarNumbers[];
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
  winningNumbers?: ISevenStarNumbers;
}

export default NSevenStar;
