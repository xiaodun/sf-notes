import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Table, Space, message } from "antd";
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
};
const BonusPreviewModal: ForwardRefRenderFunction<
  IBonusPreviewModal,
  IBonusPreviewModalProps
> = (props, ref) => {
  const [state, setState] = useState<IBonusPreviewModalState>(defaultState);
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
        // 不在这里过滤，保留所有数据用于预览模式
        allOddResultListRef.current = data;
        setState((preState) => ({
          ...preState,
          total: data.length,
          tableLoading: false,
          oddResultList: data.slice(
            (preState.currentPage - 1) * pageSize,
            preState.currentPage * pageSize
          ),
        }));
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
          <Button size="small" onClick={() => onResultRandom(true)}>
            随机
          </Button>
          <Button size="small" onClick={() => onResultRandom(false)}>
            预览
          </Button>
          <Button type="primary" onClick={onCancel}>
            关闭
          </Button>
        </Space>
      }
      onCancel={onCancel}
      centered
    >
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
        // 预览模式不需要过滤，使用所有数据
        drafState.oddResultList = allOddResultListRef.current.slice(
          (page - 1) * pageSize,
          page * pageSize
        );
      })
    );
  }

  function onResultRandom(isRandom: boolean) {
    setState(
      produce(state, (drafState) => {
        if (isRandom) {
          // 获取所有数据
          const allList = allOddResultListRef.current;

          if (allList.length === 0) {
            message.warning("没有数据");
            return;
          }

          // 如果获取到的数据不在范围内，重新生成（最多尝试100次）
          let attempts = 0;
          let randomIndex: number;
          let selectedItem: NFootball.IOddResult;

          do {
            randomIndex = Math.floor(Math.random() * allList.length);
            selectedItem = allList[randomIndex];
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
          // 预览模式不需要过滤，使用所有数据
          drafState.oddResultList = allOddResultListRef.current.slice(
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
  }
};
export default forwardRef(BonusPreviewModal);
