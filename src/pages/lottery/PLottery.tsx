import React, { useEffect, useRef, useState } from "react";
import { connect, ConnectRC } from "umi";
import {
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Card,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import NLottery, { ILotteryNumbers, IFixedNumber } from "./NLottery";
import SLottery from "./SLottery";
import { MDLottery as MDLotteryActions } from "./models/MDLottery";
import AddLotteryModal, {
  IAddLotteryModal,
} from "./components/AddLotteryModal";

export interface IPLotteryProps {
  MDLottery: {
    rsp: {
      list: NLottery[];
    };
  };
}

const PLottery: ConnectRC<IPLotteryProps> = (props) => {
  const { MDLottery } = props;
  const addLotteryModalRef = useRef<IAddLotteryModal>();
  const [fixedNumbersModalVisible, setFixedNumbersModalVisible] =
    useState(false);
  const [fixedNumbersForm] = Form.useForm();
  const [formListRemoveAllRef, setFormListRemoveAllRef] = useState<{
    removeAll: () => void;
  } | null>(null);
  const [globalFixedNumbers, setGlobalFixedNumbers] = useState<IFixedNumber[]>(
    []
  );

  useEffect(() => {
    document.title = "大乐透";
    NModel.dispatch(new MDLotteryActions.ARGetLotteryList());
    // 加载全局固定号码
    loadFixedNumbers();
  }, []);

  function loadFixedNumbers() {
    SLottery.getFixedNumbers().then((rsp) => {
      if (rsp.success && rsp.data) {
        setGlobalFixedNumbers(rsp.data);
      }
    });
  }

  function onAddOk() {
    // 添加成功后不需要刷新列表，因为会直接跳转到投注页面
  }

  return (
    <div>
      <AddLotteryModal ref={addLotteryModalRef} onOk={onAddOk} />

      <Table
        rowKey="id"
        columns={[
          {
            title: "名称",
            key: "name",
            dataIndex: "name",
          },
          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDLottery.rsp.list}
        pagination={false}
      ></Table>
      <PageFooter>
        <Space>
          <Button onClick={showAddModal}>添加预测</Button>
          <Button
            onClick={() => {
              // 将固定号码数组转换为表单格式
              const items = globalFixedNumbers.map(
                (item: IFixedNumber, index) => {
                  const frontStr = item.numbers.front
                    .map((n) => (n < 10 ? `0${n}` : String(n)))
                    .join(" ");
                  const backStr = item.numbers.back
                    .map((n) => (n < 10 ? `0${n}` : String(n)))
                    .join(" ");
                  return {
                    key: `item-${index}`,
                    numbers: `${frontStr} ${backStr}`,
                    betAmount: item.betAmount || undefined,
                  };
                }
              );
              // 先重置表单，再设置值
              fixedNumbersForm.resetFields();
              fixedNumbersForm.setFieldsValue({
                items:
                  items.length > 0
                    ? items
                    : [{ numbers: "", betAmount: undefined }],
              });
              setFixedNumbersModalVisible(true);
            }}
          >
            固定号码
          </Button>
        </Space>
      </PageFooter>

      {/* 固定号码编辑模态框 */}
      <Modal
        title="编辑固定号码"
        open={fixedNumbersModalVisible}
        onOk={handleSaveFixedNumbers}
        onCancel={() => {
          setFixedNumbersModalVisible(false);
          fixedNumbersForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
        width={600}
        footer={[
          <Button
            key="clear"
            danger
            onClick={() => {
              if (formListRemoveAllRef && formListRemoveAllRef.removeAll) {
                formListRemoveAllRef.removeAll();
              } else {
                // 备用方案：直接重置表单
                fixedNumbersForm.setFieldsValue({ items: [] });
                fixedNumbersForm.resetFields(["items"]);
              }
            }}
          >
            清空
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setFixedNumbersModalVisible(false);
              fixedNumbersForm.resetFields();
            }}
          >
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleSaveFixedNumbers}>
            保存
          </Button>,
        ]}
      >
        <Form form={fixedNumbersForm} layout="vertical">
          <Form.List name="items">
            {(fields, { add, remove }) => {
              // 保存 removeAll 函数引用，供清空按钮使用
              if (!formListRemoveAllRef) {
                setFormListRemoveAllRef({
                  removeAll: () => {
                    // 从后往前删除所有字段，避免索引变化问题
                    for (let i = fields.length - 1; i >= 0; i--) {
                      remove(i);
                    }
                  },
                });
              } else {
                // 更新 removeAll 函数，使用最新的 fields
                formListRemoveAllRef.removeAll = () => {
                  for (let i = fields.length - 1; i >= 0; i--) {
                    remove(i);
                  }
                };
              }
              return (
                <>
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        border: "1px solid #d9d9d9",
                        borderRadius: 4,
                      }}
                    >
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <Form.Item
                          label="号码"
                          name={[field.name, "numbers"]}
                          rules={[
                            { required: true, message: "请输入号码" },
                            {
                              validator: (_, value) => {
                                if (!value || !value.trim()) {
                                  return Promise.resolve();
                                }
                                const numbers = value
                                  .split(/\s+/)
                                  .map((n: string) => parseInt(n.trim()))
                                  .filter((n: number) => !isNaN(n));
                                if (numbers.length < 7) {
                                  return Promise.reject(
                                    new Error("号码数量不足，需要7个数字")
                                  );
                                }
                                const front = numbers
                                  .slice(0, 5)
                                  .filter((n: number) => n >= 1 && n <= 35);
                                const back = numbers
                                  .slice(5, 7)
                                  .filter((n: number) => n >= 1 && n <= 12);
                                if (front.length !== 5) {
                                  return Promise.reject(
                                    new Error("前区需要5个数字（1-35）")
                                  );
                                }
                                if (back.length !== 2) {
                                  return Promise.reject(
                                    new Error("后区需要2个数字（1-12）")
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label="投注金额"
                          name={[field.name, "betAmount"]}
                          rules={[
                            { required: true, message: "请输入投注金额" },
                            {
                              validator: (_, value) => {
                                if (
                                  value === undefined ||
                                  value === null ||
                                  value === ""
                                ) {
                                  return Promise.resolve();
                                }
                                if (
                                  isNaN(value) ||
                                  value < 0 ||
                                  !Number.isInteger(value)
                                ) {
                                  return Promise.reject(
                                    new Error("投注金额必须是非负整数")
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <InputNumber
                            min={0}
                            precision={0}
                            style={{ width: "100%" }}
                          />
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          >
                            删除
                          </Button>
                        )}
                      </Space>
                    </div>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add({ numbers: "", betAmount: undefined })}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加
                    </Button>
                  </Form.Item>
                </>
              );
            }}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );

  function showAddModal() {
    addLotteryModalRef.current?.showModal(false);
  }

  function renderOptionColumn(_: any, record: NLottery) {
    return (
      <Space>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            window.umiHistory.push(
              `${NRouter.lotteryPredictPath}?id=${record.id}`
            );
          }}
        >
          编辑
        </Button>
        <Button
          type="link"
          icon={<DeleteOutlined />}
          danger
          onClick={() => {
            NModel.dispatch(new MDLotteryActions.ARDelLottery(record.id));
          }}
        >
          删除
        </Button>
      </Space>
    );
  }

  function handleSaveFixedNumbers() {
    fixedNumbersForm.validateFields().then((values) => {
      const items = values.items || [];
      const fixedNumbersList: IFixedNumber[] = [];

      for (const item of items) {
        if (!item.numbers || !item.numbers.trim()) {
          continue;
        }

        const numbers = item.numbers
          .split(/\s+/)
          .map((n: string) => parseInt(n.trim()))
          .filter((n: number) => !isNaN(n));

        if (numbers.length >= 7) {
          const front = numbers
            .slice(0, 5)
            .filter((n: number) => n >= 1 && n <= 35)
            .sort((a: number, b: number) => a - b);
          const back = numbers
            .slice(5, 7)
            .filter((n: number) => n >= 1 && n <= 12)
            .sort((a: number, b: number) => a - b);

          if (front.length === 5 && back.length === 2) {
            // 检查重复
            const frontUnique: number[] = Array.from(new Set(front));
            const backUnique: number[] = Array.from(new Set(back));
            if (frontUnique.length === 5 && backUnique.length === 2) {
              // 投注金额必填验证
              if (
                item.betAmount === undefined ||
                item.betAmount === null ||
                item.betAmount === "" ||
                isNaN(item.betAmount) ||
                item.betAmount <= 0
              ) {
                // 如果投注金额无效，跳过这个条目
                continue;
              }
              fixedNumbersList.push({
                numbers: { front: frontUnique, back: backUnique },
                betAmount: item.betAmount,
              });
            }
          }
        }
      }

      SLottery.saveFixedNumbers(fixedNumbersList).then((rsp) => {
        if (rsp.success) {
          setGlobalFixedNumbers(fixedNumbersList);
          setFixedNumbersModalVisible(false);
          fixedNumbersForm.resetFields();
        }
      });
    });
  }
};

export default connect((state: any) => ({
  MDLottery: state.MDLottery,
}))(PLottery);
