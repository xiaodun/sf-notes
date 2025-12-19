import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Mentions,
  Radio,
  InputNumber,
  Row,
  Col,
  Switch,
  Table,
  message,
  Space,
} from "antd";
import { produce } from "immer";
import NFootball from "../NFootball";
import UFootball from "../UFootball";
import SFootball from "../SFootball";
import { NMDFootball } from "umi";
export interface ICrawlingmModal {
  showModal: (id: string) => void;
}
export interface ICrawlingmModalProps {
  onOk: () => void;
  MDFootball: NMDFootball.IState;
}

export interface ITempData {
  id: string;
}
export interface ICrawlingmModalState {
  open: boolean;
  loading: boolean;
  gameList: Array<NFootball.IGameInfo>;
  codeList: string[];
}
const getDefaultTempData = (): ITempData => ({
  id: null,
});
const defaultState: ICrawlingmModalState = {
  open: false,
  loading: false,
  gameList: [],
  codeList: [],
};
const CrawlingmModal: ForwardRefRenderFunction<
  ICrawlingmModal,
  ICrawlingmModalProps
> = (props, ref) => {
  const [state, setState] = useState<ICrawlingmModalState>(defaultState);
  const tempDataRef = useRef<ITempData>(getDefaultTempData());
  const [form] = Form.useForm();
  const { MDFootball } = props;
  useImperativeHandle(ref, () => ({
    showModal: (id: string) => {
      tempDataRef.current.id = id;
      let newState = { ...state, open: true };
      setState(newState);
      reqAllowGuessGame(newState);
    },
  }));

  return (
    <Modal
      width="800px"
      title="选择比赛"
      maskClosable={false}
      bodyStyle={{ maxHeight: "670px", overflowY: "scroll" }}
      open={state.open}
      footer={
        <Button loading={state.loading} type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button onClick={handleSelectFour}>选四个</Button>
        </Space>
      </div>
      <Table
        rowSelection={{
          hideSelectAll: true,
          type: "checkbox",
          selectedRowKeys: state.codeList,
          onChange: (selectedRowKeys: React.Key[]) => {
            // 限制最多选择4个
            const newSelectedKeys = (selectedRowKeys as string[]).slice(0, 4);
            setState(
              produce(state, (drafState) => {
                drafState.codeList = newSelectedKeys;
              })
            );
          },
          getCheckboxProps: (record) => {
            const isSelected = state.codeList.includes(record.code);
            const isFull = state.codeList.length >= 4;
            return {
              disabled: isFull && !isSelected, // 如果已选满4个且当前行未选中，则禁用
            };
          },
        }}
        onRow={(record) => {
          const code = record.code;
          const isSelected = state.codeList.includes(code);
          const isFull = state.codeList.length >= 4;
          const isDisabled = isFull && !isSelected;

          return {
            onClick: () => {
              // 如果已选满4个且当前行未选中，则不允许点击
              if (isDisabled) {
                return;
              }

              let newCodeList: string[];

              if (isSelected) {
                // 如果已选中，则取消选中
                newCodeList = state.codeList.filter((item) => item !== code);
              } else {
                // 如果未选中，则添加到选中列表（最多4个）
                if (state.codeList.length < 4) {
                  newCodeList = [...state.codeList, code];
                } else {
                  // 如果已经4个了，不允许再添加
                  return;
                }
              }

              setState(
                produce(state, (drafState) => {
                  drafState.codeList = newCodeList;
                })
              );
            },
            style: {
              cursor: isDisabled ? "not-allowed" : "pointer",
              opacity: isDisabled ? 0.5 : 1,
            },
          };
        }}
        rowKey="code"
        columns={[
          {
            title: "主队",
            key: "homeTeam",
            dataIndex: "homeTeam",
          },
          {
            title: "客队",
            key: "visitingTeam",
            dataIndex: "visitingTeam",
          },
          {
            title: "日期",
            key: "time",
            dataIndex: "time",
          },
        ]}
        dataSource={state.gameList}
        pagination={false}
      ></Table>
    </Modal>
  );

  async function reqAllowGuessGame(newState: ICrawlingmModalState) {
    const rsp = await SFootball.getAllowGuessGame();
    setState(
      produce(newState, (drafState) => {
        drafState.gameList = rsp.list.filter(
          (item) =>
            MDFootball.teamOddList.findIndex((el) => el.code === item.code) ==
            -1
        );
      })
    );
  }

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  // 处理选择四个队伍
  function handleSelectFour() {
    // 计算还能选择多少个队伍（考虑已录入的数量）
    const maxSelectable =
      MDFootball.config.maxGameCount - MDFootball.teamOddList.length;

    if (maxSelectable <= 0) {
      message.error(
        `最多支持录入${MDFootball.config.maxGameCount}场比赛，已满`
      );
      return;
    }

    // 获取当前未选中的队伍
    const unselectedCodes = state.gameList
      .map((item) => item.code)
      .filter((code) => !state.codeList.includes(code));

    // 计算需要选择的数量（最多4个，但不能超过可选择的限制）
    const needSelectCount = Math.min(4, maxSelectable);

    // 如果未选中的队伍数量不足
    if (unselectedCodes.length < needSelectCount) {
      message.warning(
        `可选择的比赛不足${needSelectCount}场，已选择${unselectedCodes.length}场`
      );
    }

    // 判断当前已选中的数量
    const currentSelectedCount = state.codeList.length;

    let newCodeList: string[];

    if (currentSelectedCount >= 4) {
      // 如果已经有4个或更多，则随机替换为新的4个
      // 随机打乱数组
      const shuffled = [...unselectedCodes].sort(() => Math.random() - 0.5);
      const codesToSelect = shuffled.slice(0, needSelectCount);
      newCodeList = codesToSelect;
    } else {
      // 如果少于4个，则随机补充到4个
      const needMore = needSelectCount - currentSelectedCount;
      // 随机打乱数组
      const shuffled = [...unselectedCodes].sort(() => Math.random() - 0.5);
      const codesToSelect = shuffled.slice(0, needMore);
      newCodeList = [...state.codeList, ...codesToSelect];
    }

    setState(
      produce(state, (drafState) => {
        drafState.codeList = newCodeList;
      })
    );
  }

  async function onOk() {
    if (!state.codeList.length) {
      message.error("请选择比赛");
    } else if (state.codeList.length > 4) {
      message.error("最多只能选择4场比赛");
    } else if (
      state.codeList.length + MDFootball.teamOddList.length >
      MDFootball.config.maxGameCount
    ) {
      message.error(
        `只能再选择${
          MDFootball.config.maxGameCount - MDFootball.teamOddList.length
        }场比赛`
      );
    } else {
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );
      for (let i = 0; i < state.codeList.length; i++) {
        const gameInfos = state.gameList.find(
          (item) => item.code == state.codeList[i]
        );
        const oddInfoRsp = await SFootball.getSingleOddInfo(
          gameInfos.code,
          gameInfos.bet_id
        );
        await SFootball.saveTeamOdds(tempDataRef.current.id, oddInfoRsp.data);
      }
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );
      props.onOk();
      onCancel();
    }
  }
};
export default forwardRef(CrawlingmModal);
