import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Table, Space, message, Radio, InputNumber } from "antd";
import NFootball from "../NFootball";
import UCopy from "@/common/utils/UCopy";
import { produce } from "immer";
import SelfStyle from "./BonusPreviewModal.less";
import UNumber from "@/common/utils/UNumber";
import SFootball from "../SFootball";
export interface IBonusPreviewModal {
  showModal: (
    id: string,
    teamOddList: Array<NFootball.ITeamRecordOdds>
  ) => void;
}
export interface IBonusPreviewModalProps {}

export interface IBonusPreviewModalState {
  id: string;
  teamCount: number;
  total: number;
  currentPage: number;
  open: boolean;
  currentResultIndex: number;
  tableLoading: boolean;
  teamOddList: Array<NFootball.ITeamRecordOdds>;
  oddResultList: Array<NFootball.IOddResult>;
  filterType: "all" | "single" | "half" | "goal" | "score";
  filterGameCount: number; // 筛选的比赛场数
}
const defaultState: IBonusPreviewModalState = {
  id: null,
  teamCount: 0,
  currentPage: 1,
  total: 0,
  open: false,
  currentResultIndex: null,
  tableLoading: false,
  oddResultList: [],
  teamOddList: [],
  filterType: "all",
  filterGameCount: 4, // 默认4场
};
const BonusPreviewModal: ForwardRefRenderFunction<
  IBonusPreviewModal,
  IBonusPreviewModalProps
> = (props, ref) => {
  const [state, setState] = useState<IBonusPreviewModalState>(defaultState);
  const [randomCount, setRandomCount] = useState<number | null>(1);
  const [addedItems, setAddedItems] = useState<
    Map<string, NFootball.IOddResult>
  >(new Map());

  const allOddResultListRef = useRef<Array<NFootball.IOddResult>>([]);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // 创建 Web Worker

    workerRef.current = new Worker("/oddResultWorker.js");
    workerRef.current.onmessageerror = (e) => {
      console.error("Worker message error:", e);
    };

    // 监听 Worker 消息
    workerRef.current.onmessage = (e) => {
      const { success, data, error } = e.data;
      if (success) {
        // 保留所有数据用于筛选
        allOddResultListRef.current = data;
        // 应用当前筛选条件（使用最新的 state）
        setState((preState) => {
          const filteredData = filterOddResultList(
            data,
            preState.filterType,
            preState.filterGameCount
          );
          return {
            ...preState,
            total: filteredData.length,
            tableLoading: false,
            currentPage: 1,
            oddResultList: filteredData.slice(0, pageSize),
          };
        });
      } else {
        console.error("Worker error:", error);
      }
    };

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    showModal: (id: string, teamOddList: Array<NFootball.ITeamRecordOdds>) => {
      setState(
        produce((draft) => {
          draft.open = true;
          draft.tableLoading = true;
          draft.id = id;
          draft.teamCount = teamOddList.length;
          draft.teamOddList = teamOddList;
          draft.filterType = "all"; // 重置筛选条件
          draft.filterGameCount = 4; // 重置场数筛选为默认4
          draft.currentPage = 1; // 重置页码
        })
      );
      setAddedItems(new Map());
      initializeAddedItems(id);

      workerRef.current.postMessage({ teamOddList });
    },
  }));

  const pageSize = 5;
  return (
    <Modal
      width="960px"
      title="奖金"
      maskClosable={false}
      open={state.open}
      bodyStyle={{ padding: "5px 24px" }}
      footer={
        <Space>
          <InputNumber
            size="small"
            min={1}
            max={100}
            value={randomCount}
            onChange={setRandomCount}
            placeholder="次数"
            style={{ width: 70 }}
          />
          <Button
            size="small"
            onClick={() =>
              handleMultipleExecution(() => onResultRandom(true))
            }
          >
            随机
          </Button>
          <Button size="small" onClick={() => onResultRandom(false)}>
            预览
          </Button>
          <Button
            size="small"
            onClick={() => handleMultipleExecution(onRandomPage)}
          >
            随机页数
          </Button>
          <Button type="primary" onClick={onCancel}>
            关闭
          </Button>
        </Space>
      }
      onCancel={onCancel}
      centered
    >
      <div style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <span style={{ marginRight: 8 }}>类型：</span>
            <Radio.Group
              value={state.filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="single">胜平负</Radio.Button>
              <Radio.Button value="half">半全场</Radio.Button>
              <Radio.Button value="goal">总进球</Radio.Button>
              <Radio.Button value="score">比分</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <span style={{ marginRight: 8 }}>场数：</span>
            <Radio.Group
              value={state.filterGameCount}
              onChange={(e) => handleGameCountChange(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value={4}>4</Radio.Button>
              <Radio.Button value={3}>3</Radio.Button>
              <Radio.Button value={2}>2</Radio.Button>
              <Radio.Button value={1}>1</Radio.Button>
            </Radio.Group>
          </div>
        </Space>
      </div>
      <div className={SelfStyle.main}>
        <Table
          className={
            state.currentResultIndex != null
              ? "single"
              : "count" + state.teamCount
          }
          rowKey={(record) =>
            record.list.map((item) => item.codeDesc).join("|")
          }
          loading={state.tableLoading}
          columns={[
            {
              title: "结果",
              render: renderResultColumn,
            },
            {
              title: "赔率",
              render: renderCountColumn,
            },
            {
              title: "操作",
              render: renderActionColumn,
            },
          ]}
          dataSource={state.oddResultList}
          pagination={{
            position: ["topCenter"],
            current: state.currentPage,
            onChange: onPageChange,
            total: state.total,
            hideOnSinglePage: true,
            simple: true,
            pageSize,
            showQuickJumper: true,
            showSizeChanger: false,
          }}
        ></Table>
      </div>
    </Modal>
  );
  // 初始化已存在的奖金项目
  async function initializeAddedItems(id: string) {
    const predictInfo = await SFootball.getPredictInfoById(id);
    const newAddedItems = new Map(Object.entries(predictInfo.data.bonusItems));
    setAddedItems(newAddedItems);
  }
  function fixedWidth(char: string) {
    return `<span style="width:80px;display:inline-block">${char}</span>`;
  }
  function onPageChange(page: number) {
    setState(
      produce(state, (drafState) => {
        drafState.currentPage = page;
        // 应用筛选后的数据
        const filteredData = filterOddResultList(
          allOddResultListRef.current,
          drafState.filterType,
          drafState.filterGameCount
        );
        drafState.oddResultList = filteredData.slice(
          (page - 1) * pageSize,
          page * pageSize
        );
      })
    );
  }

  // 筛选赔率结果列表
  function filterOddResultList(
    data: Array<NFootball.IOddResult>,
    filterType: "all" | "single" | "half" | "goal" | "score",
    filterGameCount: number
  ): Array<NFootball.IOddResult> {
    return data.filter((oddResult) => {
      // 先按场数筛选
      if (oddResult.list.length !== filterGameCount) {
        return false;
      }

      // 再按类型筛选
      if (filterType === "all") {
        return true;
      }

      // 检查所有场次是否都是指定类型
      return oddResult.list.every((item) => {
        if (filterType === "single") {
          // 胜平负包括让球胜平负
          return (
            item.isWin ||
            item.isDraw ||
            item.isLose ||
            item.isHandicapWin ||
            item.isHandicapDraw ||
            item.isHandicapLose
          );
        } else if (filterType === "half") {
          return item.isHalf;
        } else if (filterType === "goal") {
          return item.isGoal;
        } else if (filterType === "score") {
          return item.isScore;
        }
        return false;
      });
    });
  }

  // 处理筛选类型变化
  function handleFilterChange(
    filterType: "all" | "single" | "half" | "goal" | "score"
  ) {
    setState((preState) => {
      const filteredData = filterOddResultList(
        allOddResultListRef.current,
        filterType,
        preState.filterGameCount
      );
      return {
        ...preState,
        filterType,
        currentPage: 1, // 重置到第一页
        total: filteredData.length,
        oddResultList: filteredData.slice(0, pageSize),
      };
    });
  }

  // 处理场数筛选变化
  function handleGameCountChange(gameCount: number) {
    setState((preState) => {
      const filteredData = filterOddResultList(
        allOddResultListRef.current,
        preState.filterType,
        gameCount
      );
      return {
        ...preState,
        filterGameCount: gameCount,
        currentPage: 1, // 重置到第一页
        total: filteredData.length,
        oddResultList: filteredData.slice(0, pageSize),
      };
    });
  }

  function handleMultipleExecution(fn: () => void) {
    const count = randomCount+1 || 1;

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

  // 随机页数
  function onRandomPage() {
    // 获取筛选后的数据
    const filteredData = filterOddResultList(
      allOddResultListRef.current,
      state.filterType,
      state.filterGameCount
    );

    if (filteredData.length === 0) {
      message.warning("没有数据");
      return;
    }

    // 计算最大页数
    const maxPage = Math.ceil(filteredData.length / pageSize);

    if (maxPage === 0) {
      message.warning("没有数据");
      return;
    }

    // 随机生成页数（1 到 maxPage）
    const randomPage = Math.floor(Math.random() * maxPage) + 1;

    // 跳转到随机页
    setState(
      produce(state, (drafState) => {
        drafState.currentPage = randomPage;
        drafState.oddResultList = filteredData.slice(
          (randomPage - 1) * pageSize,
          randomPage * pageSize
        );
      })
    );
  }

  function onResultRandom(isRandom: boolean) {
    setState(
      produce(state, (drafState) => {
        if (isRandom) {
          // 获取筛选后的数据
          const filteredList = filterOddResultList(
            allOddResultListRef.current,
            drafState.filterType,
            drafState.filterGameCount
          );

          if (filteredList.length === 0) {
            message.warning("没有数据");
            return;
          }

          // 如果获取到的数据不在范围内，重新生成（最多尝试100次）
          let attempts = 0;
          let randomIndex: number;
          let selectedItem: NFootball.IOddResult;

          do {
            randomIndex = Math.floor(Math.random() * filteredList.length);
            selectedItem = filteredList[randomIndex];
            attempts++;

            // 如果符合条件（1000-250000，不包含250000），跳出循环
            if (selectedItem.count >= 1000 && selectedItem.count < 250000) {
              break;
            }

            // 如果尝试次数过多，提示并返回
            if (attempts >= 100) {
              message.warning(
                "没有符合条件的数据（1000-250000），请尝试其他操作"
              );
              return;
            }
          } while (selectedItem.count < 1000 || selectedItem.count >= 250000);

          drafState.currentResultIndex = randomIndex;
          drafState.oddResultList = [selectedItem];
        } else {
          drafState.currentResultIndex = null;
          // 预览模式使用筛选后的数据
          const filteredList = filterOddResultList(
            allOddResultListRef.current,
            drafState.filterType,
            drafState.filterGameCount
          );
          drafState.oddResultList = filteredList.slice(
            (state.currentPage - 1) * pageSize,
            state.currentPage * pageSize
          );
        }
      })
    );
  }

  function renderCountColumn(oddResult: NFootball.IOddResult) {
    return UNumber.formatWithYuanUnit(oddResult.count);
  }

  function renderActionColumn(oddResult: NFootball.IOddResult) {
    const itemKey = oddResult.list.map((item) => item.codeDesc).join("|");
    const isAdded = addedItems.has(itemKey);

    return (
      <Button
        size="small"
        type={isAdded ? "default" : "primary"}
        onClick={() => handleAddItem(itemKey, oddResult)}
      >
        {isAdded ? "删除" : "添加"}
      </Button>
    );
  }

  async function handleAddItem(
    itemKey: string,
    oddResult?: NFootball.IOddResult
  ) {
    const isAdded = addedItems.has(itemKey);

    if (isAdded) {
      // 删除操作
      await SFootball.removeBonusItem(state.id, itemKey);
      setAddedItems((prev) => {
        const newMap = new Map(prev);
        newMap.delete(itemKey);
        return newMap;
      });
    } else {
      const targetOddResult = oddResult || addedItems.get(itemKey);

      await SFootball.addBonusItem(state.id, itemKey, targetOddResult);
      setAddedItems((prev) => {
        const newMap = new Map(prev);
        newMap.set(itemKey, targetOddResult);
        return newMap;
      });
    }
  }
  function renderResultColumn(oddResult: NFootball.IOddResult) {
    let copyStr = "\n-------------------------------------\n";
    copyStr += oddResult.list.map((item) => item.codeDesc).join("\n");
    copyStr += "\n" + UNumber.formatWithYuanUnit(oddResult.count) + "\n\n\n";
    return (
      <div onClick={() => UCopy.copyStr(copyStr)}>
        {oddResult.list.map((item, index) => (
          <div
            key={index}
            style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}
            dangerouslySetInnerHTML={{
              __html: item.resultDesc,
            }}
          ></div>
        ))}
      </div>
    );
  }
  function onCancel() {
    setState(defaultState);
    setAddedItems(new Map());
    // 重置筛选条件
    allOddResultListRef.current = [];
  }
};
export default forwardRef(BonusPreviewModal);
