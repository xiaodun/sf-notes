import React, { useEffect, useRef, useState, useCallback } from "react";
import SelfStyle from "./LMaxim.less";
import SMaxim from "./SMaxim";
import { Button, message, Radio, Spin } from "antd";
import EditModal, { IEditModal } from "./components/EditModal";
import { PageFooter } from "@/common/components/page";
import { connect } from "dva";
import NModel from "@/common/namespace/NModel";
import { ConnectRC } from "umi";
import { NMDMaxim } from "./models/MDMaxim";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Browser from "@/utils/browser";
import NMaxim from "./NMaxim";

export interface PMaximProps {
  MDMaxim: NMDMaxim.IState;
}

// 格式化警句：以中文标点符号为分割点，每句话加一个空行
// 支持的标点符号：句号。、问号？、感叹号！、分号；
const formatMaximContent = (content: string) => {
  if (!content) return [];
  // 按中文标点符号分割，保留标点符号
  // 匹配：句号。、问号？、感叹号！、分号；
  const sentences = content.split(/([。？！；])/).filter((item) => item.trim());
  const result: string[] = [];
  let currentSentence = "";

  sentences.forEach((item) => {
    // 检查是否是结束标点符号
    if (/[。？！；]/.test(item)) {
      currentSentence += item;
      if (currentSentence.trim()) {
        result.push(currentSentence.trim());
        result.push(""); // 每句话后加一个空行
      }
      currentSentence = "";
    } else {
      currentSentence += item;
    }
  });

  // 处理最后没有标点符号的内容
  if (currentSentence.trim()) {
    result.push(currentSentence.trim());
  }

  return result;
};

const PMaxim: ConnectRC<PMaximProps> = (props) => {
  const { MDMaxim } = props;
  const editModalRef = useRef<IEditModal>();
  const containerRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    reqGetList(true);
    setTimeout(() => {
      document.title = "警句";
    });
  }, []);

  // 监听滚动加载 - 使用 window 滚动
  useEffect(() => {
    if (MDMaxim.mode !== "list") return;

    let ticking = false; // 节流标志

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight =
          window.innerHeight || document.documentElement.clientHeight;

        // 距离底部 100px 时加载更多
        const distanceToBottom = scrollHeight - scrollTop - clientHeight;

        if (
          distanceToBottom <= 100 &&
          !MDMaxim.loading &&
          !loadingMore &&
          MDMaxim.hasMore
        ) {
          loadMore();
        }
        ticking = false;
      });
    };

    // 初始检查一次，如果内容不足一屏，直接加载
    const checkInitialLoad = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight =
        window.innerHeight || document.documentElement.clientHeight;

      if (
        scrollHeight <= clientHeight + 10 && // 允许10px的误差
        !MDMaxim.loading &&
        !loadingMore &&
        MDMaxim.hasMore &&
        MDMaxim.rsp.list.length > 0
      ) {
        loadMore();
      }
    };

    // 延迟检查，确保 DOM 已渲染
    const timer = setTimeout(checkInitialLoad, 300);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [
    MDMaxim.mode,
    MDMaxim.loading,
    MDMaxim.hasMore,
    MDMaxim.rsp.list.length,
    loadingMore,
    loadMore,
  ]);

  // 获取列表数据（仅用于重置）
  const reqGetList = useCallback(
    async (reset: boolean = false) => {
      if (!reset) {
        // 非重置模式不应该调用这个函数
        return;
      }

      NModel.dispatch(new NMDMaxim.ARSetPage(1));
      NModel.dispatch(new NMDMaxim.ARSetHasMore(true));
      NModel.dispatch(new NMDMaxim.ARSetLoading(true));

      try {
        const rsp = await SMaxim.getList({
          page: 1,
          pageSize: MDMaxim.pageSize,
        });

        if (rsp.success) {
          NModel.dispatch(new NMDMaxim.ARSetRsp(rsp));
          NModel.dispatch(new NMDMaxim.ARSetCurrentIndex(0));

          // 判断是否还有更多数据
          const total = (rsp as any).total || 0;
          const hasMore = rsp.list.length < total;
          NModel.dispatch(new NMDMaxim.ARSetHasMore(hasMore));
        } else {
          message.error("加载失败");
        }
      } catch (error) {
        message.error("加载失败");
      } finally {
        NModel.dispatch(new NMDMaxim.ARSetLoading(false));
        setLoadingMore(false);
      }
    },
    [MDMaxim.pageSize]
  );

  // 加载更多
  const loadMore = useCallback(async () => {
    if (MDMaxim.loading || loadingMore || !MDMaxim.hasMore) return;

    setLoadingMore(true);
    const nextPage = MDMaxim.page + 1;

    NModel.dispatch(new NMDMaxim.ARSetLoading(true));
    try {
      const rsp = await SMaxim.getList({
        page: nextPage,
        pageSize: MDMaxim.pageSize,
      });

      if (rsp.success) {
        // 检查返回的数据是否已经存在，避免重复追加
        const existingIds = new Set(MDMaxim.rsp.list.map((item) => item.id));
        const newItems = rsp.list.filter((item) => !existingIds.has(item.id));

        if (newItems.length > 0) {
          NModel.dispatch(new NMDMaxim.ARAppendList(newItems));
        }

        // 更新页码
        NModel.dispatch(new NMDMaxim.ARSetPage(nextPage));

        // 判断是否还有更多数据：使用 total 和当前已加载的数据量来判断
        const currentListLength = MDMaxim.rsp.list.length;
        const loadedCount =
          currentListLength +
          (newItems.length > 0 ? newItems.length : rsp.list.length);
        const total = (rsp as any).total || 0;
        const hasMore = loadedCount < total;
        NModel.dispatch(new NMDMaxim.ARSetHasMore(hasMore));
      } else {
        message.error("加载更多失败");
      }
    } catch (error) {
      message.error("加载更多失败");
    } finally {
      NModel.dispatch(new NMDMaxim.ARSetLoading(false));
      setLoadingMore(false);
    }
  }, [
    MDMaxim.page,
    MDMaxim.pageSize,
    MDMaxim.loading,
    loadingMore,
    MDMaxim.hasMore,
    MDMaxim.rsp.list,
  ]);

  // 获取一个不同于当前索引的随机索引
  const getRandomDifferentIndex = (
    currentIndex: number,
    total: number
  ): number => {
    if (total <= 1) return 0;
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * total);
    } while (randomIndex === currentIndex && total > 1);
    return randomIndex;
  };

  // 切换到随机模式并选择不同的警句
  const switchToRandom = () => {
    if (MDMaxim.rsp.list.length === 0) {
      message.warning("暂无数据");
      return;
    }
    const currentIndex = MDMaxim.currentIndex;
    const randomIndex = getRandomDifferentIndex(
      currentIndex,
      MDMaxim.rsp.list.length
    );
    NModel.dispatch(new NMDMaxim.ARSetCurrentIndex(randomIndex));
  };

  // 切换模式
  const handleModeChange = (e: any) => {
    const mode = e.target.value;
    const wasRandom = MDMaxim.mode === "random";
    NModel.dispatch(new NMDMaxim.ARSetMode(mode));
    if (mode === "random" && MDMaxim.rsp.list.length > 0) {
      // 如果从随机模式切换到随机模式（再次点击随机按钮），或者首次切换到随机模式
      if (wasRandom) {
        // 已经在随机模式，点击随机按钮时切换到另一个不同的警句
        switchToRandom();
      } else {
        // 首次切换到随机模式时自动随机选择一个
        switchToRandom();
      }
    }
  };

  // 添加
  const onAddMaxim = () => {
    editModalRef.current?.showModal();
  };

  // 编辑
  const onEditMaxim = (maxim: NMaxim) => {
    editModalRef.current?.showModal(maxim);
  };

  // 删除
  const onDeleteMaxim = async (maxim: NMaxim) => {
    if (!maxim?.id) {
      message.warning("请选择要删除的项");
      return;
    }

    try {
      const rsp = await SMaxim.delItem(maxim.id);
      if (rsp.success) {
        message.success("删除成功");
        reqGetList(true);
      } else {
        message.error(rsp.msg || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  const isMobile = Browser.isMobile();
  const currentMaxim = MDMaxim.rsp.list[MDMaxim.currentIndex];

  return (
    <div
      className={`${SelfStyle.maximContainer} ${
        isMobile ? SelfStyle.mobile : ""
      }`}
    >
      <div ref={containerRef} className={SelfStyle.contentContainer}>
        {MDMaxim.rsp.list.length === 0 ? (
          <div className={SelfStyle.emptyState}>
            <p>暂无数据，点击下方按钮添加第一条吧！</p>
          </div>
        ) : MDMaxim.mode === "list" ? (
          <div ref={listContainerRef} className={SelfStyle.listContainer}>
            {MDMaxim.rsp.list.map((maxim, index) => (
              <div key={maxim.id || index} className={SelfStyle.maximItem}>
                <div className={SelfStyle.maximContent}>
                  {formatMaximContent(maxim.content).map((line, i) => (
                    <p key={i}>{line || "\u00A0"}</p>
                  ))}
                </div>
                <div className={SelfStyle.maximActions}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditMaxim(maxim)}
                  >
                    修改
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteMaxim(maxim)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
            {MDMaxim.loading && (
              <div className={SelfStyle.loadingMore}>
                <Spin size="small" />
                <span style={{ marginLeft: 8 }}>加载中...</span>
              </div>
            )}
            {!MDMaxim.hasMore && MDMaxim.rsp.list.length > 0 && (
              <div className={SelfStyle.noMore}>没有更多了</div>
            )}
          </div>
        ) : (
          <div className={SelfStyle.randomContainer}>
            {currentMaxim && (
              <div className={SelfStyle.maximItem}>
                <div className={SelfStyle.maximContent}>
                  {formatMaximContent(currentMaxim.content).map((line, i) => (
                    <p key={i}>{line || "\u00A0"}</p>
                  ))}
                </div>
                <div className={SelfStyle.maximActions}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEditMaxim(currentMaxim)}
                  >
                    修改
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => onDeleteMaxim(currentMaxim)}
                  >
                    删除
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <PageFooter>
        <Radio.Group
          value={MDMaxim.mode}
          onChange={handleModeChange}
          buttonStyle="solid"
          size={isMobile ? "small" : "middle"}
        >
          <Radio.Button value="list">列表</Radio.Button>
          <Radio.Button
            value="random"
            onClick={(e) => {
              // 在随机模式下，点击随机按钮时切换到另一个不同的警句
              if (MDMaxim.mode === "random") {
                e.stopPropagation();
                switchToRandom();
              }
            }}
          >
            随机
          </Radio.Button>
        </Radio.Group>
        <Button
          onClick={onAddMaxim}
          size={isMobile ? "small" : "middle"}
          icon={isMobile ? <PlusOutlined /> : undefined}
        >
          {isMobile ? "" : "添加"}
        </Button>
      </PageFooter>

      <EditModal
        onOk={() => reqGetList(true)}
        ref={editModalRef}
        rsp={MDMaxim.rsp}
      />
    </div>
  );
};

export default connect(({ MDMaxim }: NModel.IState) => ({
  MDMaxim,
}))(PMaxim);
