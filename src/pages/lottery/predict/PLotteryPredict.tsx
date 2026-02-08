import React, { useEffect, useState } from "react";
import {
  Button,
  Space,
  InputNumber,
  Card,
  Modal,
  Checkbox,
  DatePicker,
  Select,
  Tag,
} from "antd";
import { CopyOutlined } from "@ant-design/icons";
import moment, { Moment } from "moment";
import qs from "qs";
import NRouter from "@/../config/router/NRouter";
import NLottery, {
  ILotteryNumbers,
  IFixedNumber,
  IMatchResult,
  IPrizeInfo,
} from "../NLottery";
import SLottery from "../SLottery";
import QRCode from "qrcode.react";
import UCopy from "@/common/utils/UCopy";
import SelfStyle from "./LLotteryPredict.less";

export interface IPLotteryPredictProps {}

const PLotteryPredict: React.FC<IPLotteryPredictProps> = () => {
  const [lottery, setLottery] = useState<NLottery | null>(null);
  const [count, setCount] = useState(5);
  const [countModalVisible, setCountModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewNumbersList, setPreviewNumbersList] = useState<
    ILotteryNumbers[]
  >([]);
  const [qrCodeVisible, setQrCodeVisible] = useState(false);
  const [includeFixedNumbers, setIncludeFixedNumbers] = useState(true);
  const [matchResults, setMatchResults] = useState<IMatchResult[]>([]);
  const [loadingWinningNumbers, setLoadingWinningNumbers] = useState(false);
  const [randomCount, setRandomCount] = useState<number | null>(1);

  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as { id: string };

  useEffect(() => {
    if (urlQuery.id) {
      loadLottery();
    }
  }, [urlQuery.id]);
  useEffect(() => {
    document.title = "今天中大奖！";
  }, []);

  /**
   * 计算下一个开奖日期（大乐透每周一、三、六开奖，销售截止时间21:00）
   */
  function calculateNextDrawDate(createTime: number): string {
    const createDate = moment(createTime);
    const dayOfWeek = createDate.day(); // 0=周日, 1=周一, ..., 6=周六

    // 大乐透开奖日：周一(1)、周三(3)、周六(6)
    const drawDays = [1, 3, 6];

    // 如果创建日期就是开奖日，且时间在21:00之前，则当天开奖
    if (drawDays.includes(dayOfWeek)) {
      const cutoffTime = createDate.clone().hour(21).minute(0);
      if (createDate.isBefore(cutoffTime)) {
        return createDate.format("YYYY-MM-DD");
      }
    }

    // 否则找下一个开奖日
    let nextDate = createDate.clone().add(1, "day");
    let attempts = 0;
    while (attempts < 7) {
      const nextDayOfWeek = nextDate.day();
      if (drawDays.includes(nextDayOfWeek)) {
        return nextDate.format("YYYY-MM-DD");
      }
      nextDate = nextDate.clone().add(1, "day");
      attempts++;
    }

    // 如果7天内没找到，返回创建日期后的第一个周一
    return createDate
      .clone()
      .add(1, "week")
      .startOf("week")
      .add(1, "day")
      .format("YYYY-MM-DD");
  }

  /**
   * 生成最近一个月的开奖日期列表（大乐透每周一、三、六开奖）
   */
  function generateDrawDateOptions(): string[] {
    const drawDays = [1, 3, 6]; // 周一、周三、周六
    const dates: string[] = [];
    const today = moment();
    const oneMonthAgo = moment().subtract(1, "month");

    // 从一个月前开始，找到第一个开奖日
    let currentDate = oneMonthAgo.clone();
    while (!drawDays.includes(currentDate.day())) {
      currentDate.add(1, "day");
    }

    // 生成从一个月前到今天的开奖日期列表
    while (currentDate.isSameOrBefore(today)) {
      if (drawDays.includes(currentDate.day())) {
        dates.push(currentDate.format("YYYY-MM-DD"));
      }
      currentDate.add(1, "day");
    }

    // 如果列表为空，至少包含今天（如果是开奖日）或下一个开奖日
    if (dates.length === 0) {
      const nextDrawDate = calculateNextDrawDate(today.valueOf());
      dates.push(nextDrawDate);
    }

    // 按时间倒序排列（最新的在前面）
    return dates.reverse();
  }

  function loadLottery() {
    SLottery.getLotteryList().then((rsp) => {
      if (rsp.success && rsp.data) {
        const found = rsp.data.find((item) => item.id === urlQuery.id);
        if (found) {
          // 如果没有开奖日期，根据创建时间计算
          if (!found.drawDate) {
            found.drawDate = calculateNextDrawDate(found.createTime);
          }
          setLottery(found);
          // 如果有中奖号码，计算匹配结果
          if (found.winningNumbers) {
            calculateMatchResults(found);
          }
        } else {
          window.umiHistory.push(NRouter.lotteryPath);
        }
      }
    });
  }

  /**
   * 生成随机号码
   */
  function generateRandomNumbers(): ILotteryNumbers {
    // 前区：1-35，随机选择5个不重复的数字
    const front: number[] = [];
    while (front.length < 5) {
      const num = Math.floor(Math.random() * 35) + 1;
      if (!front.includes(num)) {
        front.push(num);
      }
    }
    front.sort((a, b) => a - b);

    // 后区：1-12，随机选择2个不重复的数字
    const back: number[] = [];
    while (back.length < 2) {
      const num = Math.floor(Math.random() * 12) + 1;
      if (!back.includes(num)) {
        back.push(num);
      }
    }
    back.sort((a, b) => a - b);

    return { front, back };
  }

  /**
   * 显示选择个数模态框
   */
  function handleShowGenerateModal() {
    setCountModalVisible(true);
  }

  /**
   * 确认个数，生成号码并显示预览模态框
   */
  function handleConfirmCount() {
    const newNumbersList: ILotteryNumbers[] = [];
    for (let i = 0; i < count; i++) {
      newNumbersList.push(generateRandomNumbers());
    }
    setPreviewNumbersList(newNumbersList);
    setCountModalVisible(false);
    setPreviewModalVisible(true);
  }

  function handleMultipleExecution(fn: () => void) {
    const count = (randomCount || 0) + 1 || 1;

    const run = (currentCount: number) => {
      if (currentCount <= 0) return;

      fn();
      const nextCount = currentCount - 1;
      setRandomCount(nextCount);

      setTimeout(() => {
        if (nextCount > 1) {
          run(nextCount);
        }
      }, 500);
    };

    run(count);
  }

  /**
   * 刷新预览的号码
   */
  function handleRefreshPreview() {
    handleMultipleExecution(() => {
      const newNumbersList: ILotteryNumbers[] = [];
      for (let i = 0; i < count; i++) {
        newNumbersList.push(generateRandomNumbers());
      }
      setPreviewNumbersList(newNumbersList);
    });
  }

  /**
   * 确认回填号码到列表
   */
  function handleConfirmPreview() {
    if (!lottery) return;

    const updatedLottery: NLottery = {
      ...lottery,
      numbersList: [...lottery.numbersList, ...previewNumbersList],
      updateTime: new Date().toISOString(),
    };

    SLottery.editLottery(updatedLottery).then((rsp) => {
      if (rsp.success) {
        setLottery(updatedLottery);
        setPreviewModalVisible(false);
        setPreviewNumbersList([]);
      }
    });
  }

  /**
   * 删除号码组合
   */
  function handleDeleteNumber(index: number) {
    if (!lottery) return;

    const updatedLottery: NLottery = {
      ...lottery,
      numbersList: lottery.numbersList.filter((_, i) => i !== index),
      updateTime: new Date().toISOString(),
    };

    SLottery.editLottery(updatedLottery).then((rsp) => {
      if (rsp.success) {
        setLottery(updatedLottery);
      }
    });
  }

  /**
   * 格式化号码为字符串
   */
  function formatNumbers(numbers: ILotteryNumbers): string {
    const frontStr = numbers.front
      .map((n) => (n < 10 ? `0${n}` : String(n)))
      .join(" ");
    const backStr = numbers.back
      .map((n) => (n < 10 ? `0${n}` : String(n)))
      .join(" ");
    return `${frontStr} + ${backStr}`;
  }

  const [globalFixedNumbers, setGlobalFixedNumbers] = useState<IFixedNumber[]>(
    []
  );
  // 二维码内容（用于强制更新 QRCode 组件）
  const [qrCodeContent, setQrCodeContent] = useState<string>("");

  useEffect(() => {
    // 加载全局固定号码
    SLottery.getFixedNumbers().then((rsp) => {
      if (rsp.success && rsp.data) {
        setGlobalFixedNumbers(rsp.data);
      }
    });
  }, []);

  // 当 globalFixedNumbers 或 lottery 更新时，如果二维码弹窗已打开，需要更新二维码内容
  useEffect(() => {
    if (qrCodeVisible && lottery) {
      updateQRCodeContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalFixedNumbers, qrCodeVisible, lottery]);

  /**
   * 更新二维码内容
   */
  function updateQRCodeContent() {
    if (!lottery) {
      setQrCodeContent("");
      return;
    }

    const contentLines: string[] = [];
    // 第一行：彩票类型
    contentLines.push("大乐透投注\n");

    let fixedNumbersTotalAmount = 0; // 固定号码总金额
    let randomNumbersTotalAmount = 0; // 随机号码总金额

    // 固定号码（只包含已启用的）
    const enabledFixedNumbers = globalFixedNumbers.filter(
      (item) => item.isEnabled !== undefined ? item.isEnabled : item.betAmount > 0
    );
    if (enabledFixedNumbers.length > 0) {
      enabledFixedNumbers.forEach((item) => {
        const numberLine = formatNumbers(item.numbers);
        contentLines.push(numberLine);
        if (item.betAmount && item.betAmount > 0) {
          contentLines.push(`投注金额：${item.betAmount}元`);
          fixedNumbersTotalAmount += item.betAmount;
        }
      });
    }

    // 分隔符（如果有已启用的固定号码，且随机号码不为空）
    if (enabledFixedNumbers.length > 0 && lottery.numbersList.length > 0) {
      contentLines.push("------------------------------------");
    }

    // 随机号码
    if (lottery.numbersList.length > 0) {
      const randomLines = lottery.numbersList.map((numbers) =>
        formatNumbers(numbers)
      );
      contentLines.push(...randomLines);
      // 投注金额：2 × 随机号码数量
      randomNumbersTotalAmount = lottery.numbersList.length * 2;
      contentLines.push(`投注金额：${randomNumbersTotalAmount}元`);
    }

    // 计算并显示总金额（固定号码个数为0或者随机号码个数为0则无需计算总金额）
    const totalAmount = fixedNumbersTotalAmount + randomNumbersTotalAmount;
    if (enabledFixedNumbers.length > 0 && lottery.numbersList.length > 0 && totalAmount > 0) {
      contentLines.push("------------------------------------");
      contentLines.push(`总金额：${totalAmount}元`);
    }

    setQrCodeContent(contentLines.join("\n"));
  }

  /**
   * 生成二维码内容（用于复制）
   */
  function generateQRCodeContent(): string {
    return qrCodeContent;
  }

  if (!lottery) {
    return <div>加载中...</div>;
  }

  /**
   * 匹配中奖等级
   */
  function matchPrizeLevel(
    betNumbers: ILotteryNumbers,
    winningNumbers: ILotteryNumbers
  ): IPrizeInfo | null {
    const frontMatch = betNumbers.front.filter((n) =>
      winningNumbers.front.includes(n)
    ).length;
    const backMatch = betNumbers.back.filter((n) =>
      winningNumbers.back.includes(n)
    ).length;

    // 大乐透中奖规则
    if (frontMatch === 5 && backMatch === 2) {
      return { level: 1, levelName: "一等奖", bonus: undefined }; // 浮动奖金
    } else if (frontMatch === 5 && backMatch === 1) {
      return { level: 2, levelName: "二等奖", bonus: undefined }; // 浮动奖金
    } else if (frontMatch === 5 && backMatch === 0) {
      return { level: 3, levelName: "三等奖", bonus: 10000 };
    } else if (frontMatch === 4 && backMatch === 2) {
      return { level: 4, levelName: "四等奖", bonus: 3000 };
    } else if (frontMatch === 4 && backMatch === 1) {
      return { level: 5, levelName: "五等奖", bonus: 300 };
    } else if (frontMatch === 3 && backMatch === 2) {
      return { level: 6, levelName: "六等奖", bonus: 200 };
    } else if (frontMatch === 4 && backMatch === 0) {
      return { level: 7, levelName: "七等奖", bonus: 100 };
    } else if (
      (frontMatch === 3 && backMatch === 1) ||
      (frontMatch === 2 && backMatch === 2)
    ) {
      return { level: 8, levelName: "八等奖", bonus: 15 };
    } else if (
      (frontMatch === 3 && backMatch === 0) ||
      (frontMatch === 2 && backMatch === 1) ||
      (frontMatch === 1 && backMatch === 2) ||
      (frontMatch === 0 && backMatch === 2)
    ) {
      return { level: 9, levelName: "九等奖", bonus: 5 };
    }
    return null;
  }

  /**
   * 计算匹配结果（只计算随机号码，固定号码单独显示）
   */
  function calculateMatchResults(lotteryData: NLottery) {
    if (!lotteryData.winningNumbers) {
      setMatchResults([]);
      return;
    }

    const results: IMatchResult[] = [];

    // 只计算随机号码
    lotteryData.numbersList.forEach((numbers) => {
      const prizeInfo = matchPrizeLevel(numbers, lotteryData.winningNumbers!);
      results.push({
        numbers,
        isFixed: false,
        prizeInfo: prizeInfo || undefined,
      });
    });

    // 排序：中奖的排在前面，按等级从高到低
    results.sort((a, b) => {
      if (a.prizeInfo && !b.prizeInfo) return -1;
      if (!a.prizeInfo && b.prizeInfo) return 1;
      if (a.prizeInfo && b.prizeInfo) {
        return a.prizeInfo.level - b.prizeInfo.level;
      }
      return 0;
    });

    setMatchResults(results);
  }

  /**
   * 获取固定号码的匹配结果
   */
  function getFixedNumberPrizeInfo(
    numbers: ILotteryNumbers
  ): IPrizeInfo | null {
    if (!lottery || !lottery.winningNumbers) return null;
    return matchPrizeLevel(numbers, lottery.winningNumbers);
  }

  /**
   * 更新固定号码的投注状态和金额，并实时保存（全局生效）
   */
  function handleUpdateFixedNumber(
    index: number,
    checked: boolean,
    betAmount: number
  ) {
    const newFixedNumbers = [...globalFixedNumbers];
    // 更新金额和启用状态（如果禁用，保持原金额不变；如果启用，确保金额最小为10）
    const finalBetAmount = checked 
      ? (betAmount >= 10 ? betAmount : 10)
      : newFixedNumbers[index].betAmount;
    newFixedNumbers[index] = {
      ...newFixedNumbers[index],
      betAmount: finalBetAmount,
      isEnabled: checked,
    };
    setGlobalFixedNumbers(newFixedNumbers);
    // 实时保存（全局生效）
    SLottery.saveFixedNumbers(newFixedNumbers);
  }

  /**
   * 获取中奖号码
   */
  function handleGetWinningNumbers() {
    if (!lottery || !lottery.drawDate) return;

    setLoadingWinningNumbers(true);
    SLottery.getWinningNumbers(lottery.drawDate).then((rsp) => {
      setLoadingWinningNumbers(false);
      if (rsp.success && rsp.data) {
        const updatedLottery: NLottery = {
          ...lottery,
          winningNumbers: rsp.data,
          updateTime: new Date().toISOString(),
        };
        SLottery.editLottery(updatedLottery).then((editRsp) => {
          if (editRsp.success) {
            setLottery(updatedLottery);
            calculateMatchResults(updatedLottery);
          }
        });
      }
    });
  }

  /**
   * 更新开奖日期
   */
  function handleDrawDateChange(date: string) {
    if (!lottery || !date) return;

    const updatedLottery: NLottery = {
      ...lottery,
      drawDate: date,
      updateTime: new Date().toISOString(),
    };

    SLottery.editLottery(updatedLottery).then((rsp) => {
      if (rsp.success) {
        setLottery(updatedLottery);
      }
    });
  }

  /**
   * 判断是否已到开奖日期（开奖时间20:30）
   */
  function isDrawDateReached(): boolean {
    if (!lottery || !lottery.drawDate) return false;
    const drawDate = moment(lottery.drawDate).hour(20).minute(30);
    return moment().isSameOrAfter(drawDate);
  }

  /**
   * 获取中奖信息标签颜色
   */
  function getPrizeTagColor(level: number): string {
    const colorMap: { [key: number]: string } = {
      1: "red", // 一等奖 - 红色
      2: "orange", // 二等奖 - 橙色
      3: "gold", // 三等奖 - 金色
      4: "purple", // 四等奖 - 紫色
      5: "blue", // 五等奖 - 蓝色
      6: "cyan", // 六等奖 - 青色
      7: "green", // 七等奖 - 绿色
      8: "lime", // 八等奖 - 浅绿
      9: "default", // 九等奖 - 默认
    };
    return colorMap[level] || "default";
  }

  /**
   * 判断号码是否匹配（该号码既在投注号码中，也在中奖号码中）
   */
  function isNumberMatched(
    number: number,
    betNumbers: number[],
    winningNumbers: number[]
  ): boolean {
    return betNumbers.includes(number) && winningNumbers.includes(number);
  }

  return (
    <div className={SelfStyle.main}>
      {/* 开奖日期 */}
      <Card size="small" style={{ marginBottom: 16 }} title="开奖信息">
        <Space>
          <span>开奖日期：</span>
          <Select
            value={lottery?.drawDate || undefined}
            onChange={handleDrawDateChange}
            style={{ width: 150 }}
            placeholder="请选择开奖日期"
          >
            {generateDrawDateOptions().map((date) => (
              <Select.Option key={date} value={date}>
                {date}
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleGetWinningNumbers}
            loading={loadingWinningNumbers}
          >
            开奖
          </Button>
        </Space>
      </Card>

      {/* 中奖号码 */}
      {lottery?.winningNumbers && (
        <Card
          size="small"
          className={SelfStyle.winningNumbersCard}
          style={{
            marginBottom: 16,
            backgroundColor: "#fff7e6",
            borderColor: "#ffa940",
            borderWidth: 2,
          }}
          title={
            <span
              style={{ fontSize: 16, fontWeight: "bold", color: "#d46b08" }}
            >
              中奖号码
            </span>
          }
        >
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <Space size="large" style={{ fontSize: 20, fontWeight: "bold" }}>
              <span>
                {lottery.winningNumbers.front.map((n) => (
                  <span
                    key={n}
                    style={{
                      display: "inline-block",
                      width: 40,
                      height: 40,
                      lineHeight: "40px",
                      backgroundColor: "#ff4d4f",
                      color: "#fff",
                      borderRadius: "50%",
                      margin: "0 4px",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {n < 10 ? `0${n}` : n}
                  </span>
                ))}
              </span>
              <span style={{ fontSize: 24, color: "#ff4d4f" }}>+</span>
              <span>
                {lottery.winningNumbers.back.map((n) => (
                  <span
                    key={n}
                    style={{
                      display: "inline-block",
                      width: 40,
                      height: 40,
                      lineHeight: "40px",
                      backgroundColor: "#1890ff",
                      color: "#fff",
                      borderRadius: "50%",
                      margin: "0 4px",
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {n < 10 ? `0${n}` : n}
                  </span>
                ))}
              </span>
            </Space>
          </div>
        </Card>
      )}

      {/* 固定号码配置显示 */}
      {globalFixedNumbers.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }} title="固定号码">
          <div>
            {globalFixedNumbers.map((item, index) => {
              const prizeInfo = getFixedNumberPrizeInfo(item.numbers);
              const winningNumbers = lottery?.winningNumbers;

              // 计算中奖金额显示
              // 投注金额的一半是倍数
              const multiplier =
                item.betAmount && item.betAmount > 0 ? item.betAmount / 2 : 0;

              let prizeDisplay = "";
              if (prizeInfo) {
                if (prizeInfo.level === 1 || prizeInfo.level === 2) {
                  // 一等奖、二等奖显示倍数
                  if (multiplier > 0) {
                    prizeDisplay = ` ${multiplier}倍`;
                  }
                } else if (prizeInfo.bonus !== undefined) {
                  // 其他等级显示：倍数 × 单注奖金 = 总奖金
                  if (multiplier > 0) {
                    const totalBonus = prizeInfo.bonus * multiplier;
                    prizeDisplay = ` ${multiplier}倍 × ¥${prizeInfo.bonus} = ¥${totalBonus}`;
                  } else {
                    prizeDisplay = ` ¥${prizeInfo.bonus}`;
                  }
                }
              }

              return (
                <Card
                  key={index}
                  size="small"
                  style={{
                    marginBottom: 8,
                    backgroundColor: prizeInfo ? "#f6ffed" : "transparent",
                    borderColor: prizeInfo ? "#52c41a" : undefined,
                  }}
                  title={
                    prizeInfo ? (
                      <Tag
                        color={getPrizeTagColor(prizeInfo.level)}
                        style={{ fontSize: 14 }}
                      >
                        {prizeInfo.levelName}
                        {prizeDisplay}
                      </Tag>
                    ) : null
                  }
                  extra={
                    <Button
                      type="link"
                      icon={<CopyOutlined />}
                      onClick={() => {
                        const numbersStr = formatNumbers(item.numbers);
                        UCopy.copyStr(numbersStr);
                      }}
                    >
                      复制
                    </Button>
                  }
                >
                  <div className={SelfStyle.numberItem}>
                    <Space size="large" wrap>
                      <span className={SelfStyle.frontNumbers}>
                        {item.numbers.front.map((n) => {
                          const isMatched =
                            winningNumbers &&
                            isNumberMatched(
                              n,
                              item.numbers.front,
                              winningNumbers.front
                            );
                          return (
                            <span
                              key={n}
                              className={SelfStyle.number}
                              style={{
                                backgroundColor: isMatched
                                  ? "#52c41a"
                                  : "transparent",
                                color: isMatched ? "#fff" : undefined,
                                borderRadius: 4,
                                padding: "2px 4px",
                              }}
                            >
                              {n < 10 ? `0${n}` : n}
                            </span>
                          );
                        })}
                      </span>
                      <span className={SelfStyle.separator}>+</span>
                      <span className={SelfStyle.backNumbers}>
                        {item.numbers.back.map((n) => {
                          const isMatched =
                            winningNumbers &&
                            isNumberMatched(
                              n,
                              item.numbers.back,
                              winningNumbers.back
                            );
                          return (
                            <span
                              key={n}
                              className={SelfStyle.number}
                              style={{
                                backgroundColor: isMatched
                                  ? "#52c41a"
                                  : "transparent",
                                color: isMatched ? "#fff" : undefined,
                                borderRadius: 4,
                                padding: "2px 4px",
                              }}
                            >
                              {n < 10 ? `0${n}` : n}
                            </span>
                          );
                        })}
                      </span>
                      <Space>
                        <Checkbox
                          checked={item.isEnabled !== undefined ? item.isEnabled : true}
                          onChange={(e) => {
                            const newChecked = e.target.checked;
                            const currentAmount = item.betAmount || 0;
                            const betAmount = newChecked && currentAmount < 10 ? 10 : currentAmount;
                            handleUpdateFixedNumber(index, newChecked, betAmount);
                          }}
                        >
                          投注
                        </Checkbox>
                        <InputNumber
                          min={10}
                          precision={0}
                          step={10}
                          value={item.betAmount || 10}
                          onChange={(value) => {
                            const newAmount = value && value >= 10 ? value : 10;
                            handleUpdateFixedNumber(
                              index,
                              item.isEnabled !== undefined ? item.isEnabled : true,
                              newAmount
                            );
                          }}
                          style={{ width: 100 }}
                          addonAfter="元"
                          disabled={item.isEnabled === false}
                        />
                      </Space>
                    </Space>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      )}

      {/* 随机号码列表 */}
      <div className={SelfStyle.numbersList}>
        {matchResults.length > 0
          ? matchResults.map((result, index) => {
              const originalIndex = lottery.numbersList.findIndex(
                (n) =>
                  JSON.stringify(n.front) ===
                    JSON.stringify(result.numbers.front) &&
                  JSON.stringify(n.back) === JSON.stringify(result.numbers.back)
              );
              const winningNumbers = lottery?.winningNumbers;
              return (
                <Card
                  key={index}
                  size="small"
                  style={{
                    marginBottom: 8,
                    backgroundColor: result.prizeInfo
                      ? "#f6ffed"
                      : "transparent",
                    borderColor: result.prizeInfo ? "#52c41a" : undefined,
                  }}
                  title={
                    result.prizeInfo ? (
                      <Tag
                        color={getPrizeTagColor(result.prizeInfo.level)}
                        style={{ fontSize: 14 }}
                      >
                        {result.prizeInfo.levelName}
                        {result.prizeInfo.bonus !== undefined &&
                          ` ¥${result.prizeInfo.bonus}`}
                      </Tag>
                    ) : null
                  }
                  extra={
                    <Space>
                      <Button
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          const numbersStr = formatNumbers(result.numbers);
                          UCopy.copyStr(numbersStr);
                        }}
                      >
                        复制
                      </Button>
                      {originalIndex >= 0 && (
                        <Button
                          type="link"
                          danger
                          onClick={() => handleDeleteNumber(originalIndex)}
                        >
                          删除
                        </Button>
                      )}
                    </Space>
                  }
                >
                  <div className={SelfStyle.numberItem}>
                    <span className={SelfStyle.label}>
                      第{originalIndex >= 0 ? originalIndex + 1 : index + 1}组：
                    </span>
                    <Space size="large">
                      <span className={SelfStyle.frontNumbers}>
                        {result.numbers.front.map((n) => {
                          const isMatched =
                            winningNumbers &&
                            isNumberMatched(
                              n,
                              result.numbers.front,
                              winningNumbers.front
                            );
                          return (
                            <span
                              key={n}
                              className={SelfStyle.number}
                              style={{
                                backgroundColor: isMatched
                                  ? "#52c41a"
                                  : "transparent",
                                color: isMatched ? "#fff" : undefined,
                                borderRadius: 4,
                                padding: "2px 4px",
                              }}
                            >
                              {n < 10 ? `0${n}` : n}
                            </span>
                          );
                        })}
                      </span>
                      <span className={SelfStyle.separator}>+</span>
                      <span className={SelfStyle.backNumbers}>
                        {result.numbers.back.map((n) => {
                          const isMatched =
                            winningNumbers &&
                            isNumberMatched(
                              n,
                              result.numbers.back,
                              winningNumbers.back
                            );
                          return (
                            <span
                              key={n}
                              className={SelfStyle.number}
                              style={{
                                backgroundColor: isMatched
                                  ? "#52c41a"
                                  : "transparent",
                                color: isMatched ? "#fff" : undefined,
                                borderRadius: 4,
                                padding: "2px 4px",
                              }}
                            >
                              {n < 10 ? `0${n}` : n}
                            </span>
                          );
                        })}
                      </span>
                    </Space>
                  </div>
                </Card>
              );
            })
          : lottery.numbersList.map((numbers, index) => {
              const winningNumbers = lottery?.winningNumbers;
              return (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: 8 }}
                  extra={
                    <Space>
                      <Button
                        type="link"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          const numbersStr = formatNumbers(numbers);
                          UCopy.copyStr(numbersStr);
                        }}
                      >
                        复制
                      </Button>
                      <Button
                        type="link"
                        danger
                        onClick={() => handleDeleteNumber(index)}
                      >
                        删除
                      </Button>
                    </Space>
                  }
                >
                  <div className={SelfStyle.numberItem}>
                    <span className={SelfStyle.label}>第{index + 1}组：</span>
                    <Space size="large">
                      <span className={SelfStyle.frontNumbers}>
                        {numbers.front.map((n) => {
                          const isMatched =
                            winningNumbers &&
                            isNumberMatched(
                              n,
                              numbers.front,
                              winningNumbers.front
                            );
                          return (
                            <span
                              key={n}
                              className={SelfStyle.number}
                              style={{
                                backgroundColor: isMatched
                                  ? "#52c41a"
                                  : "transparent",
                                color: isMatched ? "#fff" : undefined,
                                borderRadius: 4,
                                padding: "2px 4px",
                              }}
                            >
                              {n < 10 ? `0${n}` : n}
                            </span>
                          );
                        })}
                      </span>
                      <span className={SelfStyle.separator}>+</span>
                      <span className={SelfStyle.backNumbers}>
                        {numbers.back.map((n) => {
                          const isMatched =
                            winningNumbers &&
                            isNumberMatched(
                              n,
                              numbers.back,
                              winningNumbers.back
                            );
                          return (
                            <span
                              key={n}
                              className={SelfStyle.number}
                              style={{
                                backgroundColor: isMatched
                                  ? "#52c41a"
                                  : "transparent",
                                color: isMatched ? "#fff" : undefined,
                                borderRadius: 4,
                                padding: "2px 4px",
                              }}
                            >
                              {n < 10 ? `0${n}` : n}
                            </span>
                          );
                        })}
                      </span>
                    </Space>
                  </div>
                </Card>
              );
            })}
      </div>

      <div className={SelfStyle.bottomActions}>
        <Space>
          <Button
            size="large"
            onClick={() => {
              window.umiHistory.push(NRouter.lotteryPath);
            }}
          >
            返回
          </Button>
          {(lottery.numbersList.length > 0 ||
            globalFixedNumbers.length > 0) && (
            <Button size="large" onClick={() => setQrCodeVisible(true)}>
              生成二维码
            </Button>
          )}
          <Button type="primary" size="large" onClick={handleShowGenerateModal}>
            随机生成
          </Button>
        </Space>
      </div>

      {/* 选择个数模态框 */}
      <Modal
        title="随机生成号码"
        open={countModalVisible}
        onOk={handleConfirmCount}
        onCancel={() => setCountModalVisible(false)}
        okText="下一步"
        cancelText="取消"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <span>生成数量：</span>
            <InputNumber
              min={1}
              max={100}
              value={count}
              onChange={(value) => setCount(value || 5)}
              style={{ marginLeft: 8 }}
            />
          </div>
        </Space>
      </Modal>

      {/* 预览生成的号码模态框 */}
      <Modal
        title="预览生成的号码"
        open={previewModalVisible}
        onOk={handleConfirmPreview}
        onCancel={() => {
          setPreviewModalVisible(false);
          setPreviewNumbersList([]);
        }}
        okText="确认回填"
        cancelText="取消"
        width={600}
        footer={[
          <InputNumber
            key="count"
            size="small"
            min={1}
            max={100}
            value={randomCount}
            onChange={setRandomCount}
            placeholder="次数"
            style={{ width: 70, marginRight: 8 }}
          />,
          <Button key="refresh" onClick={handleRefreshPreview}>
            刷新
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setPreviewModalVisible(false);
              setPreviewNumbersList([]);
            }}
          >
            取消
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmPreview}>
            确认回填
          </Button>,
        ]}
      >
        <div className={SelfStyle.previewNumbersList}>
          {previewNumbersList.map((numbers, index) => (
            <Card key={index} size="small" style={{ marginBottom: 8 }}>
              <div className={SelfStyle.numberItem}>
                <span className={SelfStyle.label}>第{index + 1}组：</span>
                <Space size="large">
                  <span className={SelfStyle.frontNumbers}>
                    {numbers.front.map((n) => (
                      <span key={n} className={SelfStyle.number}>
                        {n < 10 ? `0${n}` : n}
                      </span>
                    ))}
                  </span>
                  <span className={SelfStyle.separator}>+</span>
                  <span className={SelfStyle.backNumbers}>
                    {numbers.back.map((n) => (
                      <span key={n} className={SelfStyle.number}>
                        {n < 10 ? `0${n}` : n}
                      </span>
                    ))}
                  </span>
                </Space>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      {/* 二维码模态框 */}
      <Modal
        title="二维码"
        open={qrCodeVisible}
        onCancel={() => setQrCodeVisible(false)}
        onOpenChange={(visible) => {
          if (visible) {
            // 打开弹窗时，更新二维码内容
            if (lottery) {
              updateQRCodeContent();
            }
          } else {
            // 关闭弹窗时，清空二维码内容
            setQrCodeContent("");
          }
        }}
        footer={null}
        width={600}
      >
        {/* 固定号码列表（只显示已启用的，只读） */}
        {globalFixedNumbers.filter((item) => item.isEnabled !== undefined ? item.isEnabled : item.betAmount > 0).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: "bold" }}>固定号码：</div>
            {globalFixedNumbers
              .filter((item) => item.isEnabled !== undefined ? item.isEnabled : item.betAmount > 0)
              .map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                    padding: 8,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                  }}
                >
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{formatNumbers(item.numbers)}</span>
                    <span style={{ color: "#666", fontSize: 14 }}>
                      投注金额：{item.betAmount}元
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              icon={<CopyOutlined />}
              onClick={() => {
                const content = generateQRCodeContent();
                if (content) {
                  UCopy.copyStr(content);
                }
              }}
            >
              复制
            </Button>
          </div>
          <QRCode value={qrCodeContent} size={256} />
        </div>
      </Modal>
    </div>
  );
};

export default PLotteryPredict;
