import React, { useEffect, useRef, useState } from "react";
import { connect, ConnectRC } from "umi";
import { Button, Table, Space, Modal, Form, Input, InputNumber } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import NSevenStar, { ISevenStarNumbers, IFixedNumber } from "./NSevenStar";
import SSevenStar from "./SSevenStar";
import { MDSevenStar as MDSevenStarActions } from "./models/MDSevenStar";
import AddSevenStarModal, {
  IAddSevenStarModal,
} from "./components/AddSevenStarModal";

export interface IPSevenStarProps {
  MDSevenStar: {
    rsp: {
      list: NSevenStar[];
    };
  };
}

const PSevenStar: ConnectRC<IPSevenStarProps> = (props) => {
  const { MDSevenStar } = props;
  const addSevenStarModalRef = useRef<IAddSevenStarModal>();
  const [fixedNumbersModalVisible, setFixedNumbersModalVisible] =
    useState(false);
  const [fixedNumbersForm] = Form.useForm();
  const formListRemoveAllRef = useRef<{
    removeAll: () => void;
  } | null>(null);
  const [globalFixedNumbers, setGlobalFixedNumbers] = useState<IFixedNumber[]>(
    []
  );

  useEffect(() => {
    document.title = "七星彩";
    NModel.dispatch(new MDSevenStarActions.ARGetSevenStarList());
    loadFixedNumbers();
  }, []);

  function loadFixedNumbers() {
    SSevenStar.getFixedNumbers().then((rsp) => {
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
      <AddSevenStarModal ref={addSevenStarModalRef} onOk={onAddOk} />

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
        dataSource={[...MDSevenStar.rsp.list].sort((a, b) => {
          // 新添加的记录放在最前面（按创建时间倒序）
          return (b.createTime || 0) - (a.createTime || 0);
        })}
        pagination={false}
      ></Table>
      <PageFooter>
        <Space>
          <Button onClick={showAddModal}>添加预测</Button>
          <Button
            onClick={() => {
              const items = globalFixedNumbers.map(
                (item: IFixedNumber, index) => {
                  const numbersStr = item.numbers.numbers
                    .map((n) => String(n))
                    .join(" ");
                  return {
                    key: `item-${index}`,
                    numbers: numbersStr,
                    betAmount: item.betAmount || undefined,
                  };
                }
              );
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
              if (
                formListRemoveAllRef.current &&
                formListRemoveAllRef.current.removeAll
              ) {
                formListRemoveAllRef.current.removeAll();
              } else {
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
              // 使用 useRef 存储 removeAll 函数，避免在渲染时更新状态
              if (!formListRemoveAllRef.current) {
                formListRemoveAllRef.current = {
                  removeAll: () => {
                    for (let i = fields.length - 1; i >= 0; i--) {
                      remove(i);
                    }
                  },
                };
              } else {
                formListRemoveAllRef.current.removeAll = () => {
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
                          label="号码（前6位0-9，最后1位0-14，空格分隔）"
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
                                if (numbers.length !== 7) {
                                  return Promise.reject(
                                    new Error("号码数量必须为7个")
                                  );
                                }
                                // 验证前6位：0-9
                                const front6Valid = numbers
                                  .slice(0, 6)
                                  .every((n: number) => n >= 0 && n <= 9);
                                if (!front6Valid) {
                                  return Promise.reject(
                                    new Error("前6位数字必须在0-9之间")
                                  );
                                }
                                // 验证最后1位：0-14
                                const last1Valid =
                                  numbers[6] >= 0 && numbers[6] <= 14;
                                if (!last1Valid) {
                                  return Promise.reject(
                                    new Error("最后1位数字必须在0-14之间")
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Input placeholder="例如：1 2 3 4 5 6 10" />
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
    addSevenStarModalRef.current?.showModal(false);
  }

  function renderOptionColumn(_: any, record: NSevenStar) {
    return (
      <Space>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            window.umiHistory.push(
              `${NRouter.sevenStarPredictPath}?id=${record.id}`
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
            NModel.dispatch(new MDSevenStarActions.ARDelSevenStar(record.id));
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

        if (numbers.length === 7) {
          // 验证前6位：0-9
          const front6Valid = numbers
            .slice(0, 6)
            .every((n: number) => n >= 0 && n <= 9);
          // 验证最后1位：0-14
          const last1Valid = numbers[6] >= 0 && numbers[6] <= 14;

          if (front6Valid && last1Valid) {
            if (
              item.betAmount === undefined ||
              item.betAmount === null ||
              item.betAmount === "" ||
              isNaN(item.betAmount) ||
              item.betAmount <= 0
            ) {
              continue;
            }
            fixedNumbersList.push({
              numbers: { numbers },
              betAmount: item.betAmount,
            });
          }
        }
      }

      SSevenStar.saveFixedNumbers(fixedNumbersList).then((rsp) => {
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
  MDSevenStar: state.MDSevenStar,
}))(PSevenStar);
