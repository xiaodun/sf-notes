import React, { useEffect, useState } from "react";
import { Button, Space, InputNumber, Card, Modal, Checkbox } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import qs from "qs";
import NRouter from "@/../config/router/NRouter";
import NLottery, { ILotteryNumbers, IFixedNumber } from "../NLottery";
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

  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as { id: string };

  useEffect(() => {
    document.title = "大乐透预测";
    if (urlQuery.id) {
      loadLottery();
    }
  }, [urlQuery.id]);

  function loadLottery() {
    SLottery.getLotteryList().then((rsp) => {
      if (rsp.success && rsp.data) {
        const found = rsp.data.find((item) => item.id === urlQuery.id);
        if (found) {
          setLottery(found);
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

  /**
   * 刷新预览的号码
   */
  function handleRefreshPreview() {
    const newNumbersList: ILotteryNumbers[] = [];
    for (let i = 0; i < count; i++) {
      newNumbersList.push(generateRandomNumbers());
    }
    setPreviewNumbersList(newNumbersList);
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

  useEffect(() => {
    // 加载全局固定号码
    SLottery.getFixedNumbers().then((rsp) => {
      if (rsp.success && rsp.data) {
        setGlobalFixedNumbers(rsp.data);
      }
    });
    // 从后台加载是否包含固定号码的勾选状态
    SLottery.getLotteryConfig().then((rsp) => {
      if (rsp.success && rsp.data) {
        setIncludeFixedNumbers(rsp.data.includeFixedNumbers);
      }
    });
  }, []);

  /**
   * 生成二维码内容
   */
  function generateQRCodeContent(): string {
    if (!lottery) {
      return "";
    }

    const contentLines: string[] = [];

    // 固定号码（格式与随机号码一致，包含投注金额，换行显示）
    // 根据勾选状态决定是否包含固定号码
    if (
      includeFixedNumbers &&
      globalFixedNumbers &&
      globalFixedNumbers.length > 0
    ) {
      globalFixedNumbers.forEach((item) => {
        const numberLine = formatNumbers(item.numbers);
        contentLines.push(numberLine);
        if (item.betAmount && item.betAmount > 0) {
          contentLines.push(`投注金额：${item.betAmount}元`);
        }
      });
    }

    // 分隔符（如果有固定号码，且随机号码不为空）
    if (
      includeFixedNumbers &&
      globalFixedNumbers.length > 0 &&
      lottery.numbersList.length > 0
    ) {
      contentLines.push("------------------------------------");
    }

    // 随机号码
    if (lottery.numbersList.length > 0) {
      const randomLines = lottery.numbersList.map((numbers) =>
        formatNumbers(numbers)
      );
      contentLines.push(...randomLines);
      // 投注金额：2 × 随机号码数量
      const totalAmount = lottery.numbersList.length * 2;
      contentLines.push(`投注金额：${totalAmount}元`);
    }

    return contentLines.join("\n");
  }

  if (!lottery) {
    return <div>加载中...</div>;
  }

  return (
    <div className={SelfStyle.main}>
      {/* 固定号码配置显示 */}
      {globalFixedNumbers.length > 0 && (
        <Card size="small" style={{ marginBottom: 16 }} title="固定号码">
          <div>
            {globalFixedNumbers.map((item, index) => {
              const frontStr = item.numbers.front
                .map((n) => (n < 10 ? `0${n}` : String(n)))
                .join(" ");
              const backStr = item.numbers.back
                .map((n) => (n < 10 ? `0${n}` : String(n)))
                .join(" ");
              return (
                <div key={index} style={{ marginBottom: 8 }}>
                  <div>
                    {frontStr} + {backStr}
                  </div>
                  {item.betAmount && item.betAmount > 0 && (
                    <div style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                      投注金额：{item.betAmount}元
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className={SelfStyle.numbersList}>
        {lottery.numbersList.map((numbers, index) => (
          <Card
            key={index}
            size="small"
            style={{ marginBottom: 8 }}
            extra={
              <Button
                type="link"
                danger
                onClick={() => handleDeleteNumber(index)}
              >
                删除
              </Button>
            }
          >
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
        footer={[
          <Button
            key="copy"
            icon={<CopyOutlined />}
            onClick={() => {
              const content = generateQRCodeContent();
              if (content) {
                UCopy.copyStr(content);
              }
            }}
          >
            复制
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <Checkbox
            checked={includeFixedNumbers}
            onChange={(e) => {
              const checked = e.target.checked;
              setIncludeFixedNumbers(checked);
              // 保存到后台
              SLottery.saveLotteryConfig({ includeFixedNumbers: checked });
            }}
          >
            包含固定号码
          </Checkbox>
        </div>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <QRCode value={generateQRCodeContent()} size={256} />
        </div>
      </Modal>
    </div>
  );
};

export default PLotteryPredict;
