import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import { Modal, Button, Form, Input, message, Table, Spin, Alert } from "antd";
import { produce } from "immer";
import SFootball from "../SFootball";
import NFootball from "../NFootball";
import { cloneDeep } from "lodash";

export interface IRecentFootballResultsModal {
  showModal: () => void;
}
export interface IRecentFootballResultsModalProps {}

export interface IRecentFootballResultsModalState {
  visible: boolean;
}

const defaultState: IRecentFootballResultsModalState = {
  visible: false,
};

const RecentFootballResultsModal: ForwardRefRenderFunction<
  IRecentFootballResultsModal,
  IRecentFootballResultsModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<IRecentFootballResultsModalState>(defaultState);
  const [list, setList] = useState<NFootball.IFootballMatch[]>([]);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // 获取详细赔率信息
  const loadCurrentPageOdds = async (
    allMatches: NFootball.IFootballMatch[],
    currentPage: number,
    pageSize: number
  ) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    if (
      allMatches[startIndex].goal ||
      allMatches[startIndex].half ||
      allMatches[startIndex].score
    ) {
      return;
    }

    // 获取当前页所有比赛的matchId
    const matchIds = allMatches
      .slice(startIndex, endIndex)
      .map((match) => match.matchId);

    if (matchIds.length === 0) return;

    try {
      const oddsResponse = await SFootball.getMatchOddsDetail(matchIds);
      if (oddsResponse.success) {
        // 检查是否为mock数据
        if (oddsResponse.data.isMock) {
          message.warning("详情接口请求被拦截，现在使用的是mock数据");
        }

        // 从响应中提取详细赔率数据（排除isMock字段）
        const { isMock, ...oddsData } = oddsResponse.data;

        // 使用matchId更新数据
        const newData = [...allMatches];
        for (let i = startIndex; i < pageSize * currentPage; i++) {
          const match = allMatches[i];

          if (oddsData[match.matchId] && allMatches[i]) {
            newData[i] = {
              ...match,
              ...oddsData[match.matchId],
            };
          }
        }
        setList(newData);
      }
    } catch (error) {
      console.error("获取详细赔率失败:", error);
    }
  };

  // 加载数据
  const loadData = async () => {
    setLoading(true);

    // 获取最近一个月的数据
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const response = await SFootball.getRecentMatches({ startDate, endDate });

    if (response.success) {
      setLoading(false);
      setIsMock(response.data.isMock || false);

      setList(response.data.list);

      // 获取第一页的详细赔率信息
      await loadCurrentPageOdds(response.data.list, 1, 10);
    } else {
      setLoading(false);
    }
  };

  // 分页变化处理
  const handleTableChange = async (page: number, pageSize: number) => {
    // 更新加载状态
    setLoading(true);

    // 获取新页面的详细赔率信息并更新数据
    await loadCurrentPageOdds(cloneDeep(list), page, pageSize);

    // 关闭加载状态
    setLoading(false);
  };

  // 通用渲染函数 - 用于半全场、比分、让球胜平负
  const renderDetail = (
    value: number,
    desc: string,
    record: NFootball.IFootballMatch
  ) => {
    if (value) {
      return (
        <span>
          {desc}@{value}
        </span>
      );
    }
    return <span style={{ color: "#999" }}>-</span>;
  };

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          if (!list.length) {
            loadData();
          }
        })
      );
    },
  }));

  return (
    <Modal
      width="1000px"
      title="近期战况"
      maskClosable={false}
      bodyStyle={{ height: "700px", overflow: "auto" }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Spin spinning={loading}>
        {isMock && (
          <Alert
            message="数据访问被拦截"
            description="由于网络访问被拦截，当前显示的是模拟数据。"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Table
          columns={[
            {
              title: "日期",
              dataIndex: "date",
              key: "date",
            },
            {
              title: "场次",
              dataIndex: "game",
              key: "game",
            },
            {
              title: "胜",
              dataIndex: "win",
              key: "win",
            },
            {
              title: "平",
              dataIndex: "draw",
              key: "draw",
            },
            {
              title: "负",
              dataIndex: "lose",
              key: "lose",
            },
            {
              title: "让球胜平负",
              dataIndex: "handicap",
              key: "handicap",
            },
            {
              title: "半全场",
              dataIndex: "half",
              key: "half",
              render: (value, record) =>
                renderDetail(value, record.halfDesc, record),
            },
            {
              title: "比分",
              dataIndex: "score",
              key: "score",
              render: (value, record) =>
                renderDetail(value, record.scoreDesc, record),
            },
            {
              title: "总进球",
              dataIndex: "goal",
              key: "goal",
              render: (value, record) =>
                renderDetail(value, record.goalDesc, record),
            },
          ]}
          dataSource={list}
          pagination={{
            pageSize: 10,
            total: list.length,
            showSizeChanger: false,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
            size: "default",
            style: { marginTop: 16 },
          }}
          size="small"
          scroll={{ x: 500 }}
          rowKey="matchId"
        />
      </Spin>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    setLoading(false);
  }
};
export default forwardRef(RecentFootballResultsModal);
