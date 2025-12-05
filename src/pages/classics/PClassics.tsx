import React, { useEffect, useRef, useState, useCallback } from "react";
import SelfStyle from "./LClassics.less";
import SClassics from "./SClassics";
import SAuthor from "./SAuthor";
import SDynasty from "./SDynasty";
import { Button, message, Select, Space, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import EditModal, { IEditModal } from "./components/EditModal";
import AuthorManageModal, {
  IAuthorManageModal,
} from "./components/AuthorManageModal";
import DynastyManageModal, {
  IDynastyManageModal,
} from "./components/DynastyManageModal";
import { PageFooter } from "@/common/components/page";
import { connect } from "dva";
import NModel from "@/common/namespace/NModel";
import { ConnectRC } from "umi";
import { NMDClassics, getPageSize } from "./models/MDClassics";
import Browser from "@/utils/browser";
import NClassics from "./NClassics";
import NAuthor from "./NAuthor";
import NDynasty from "./NDynasty";

export interface PClassicsProps {
  MDClassics: NMDClassics.IState;
}

const PClassics: ConnectRC<PClassicsProps> = (props) => {
  const { MDClassics } = props;
  const editModalRef = useRef<IEditModal>();
  const authorManageModalRef = useRef<IAuthorManageModal>();
  const dynastyManageModalRef = useRef<IDynastyManageModal>();

  // 防止重复加载的标志
  const loadingRef = useRef<{ authors: boolean; dynasties: boolean }>({
    authors: false,
    dynasties: false,
  });
  const [searchAuthorId, setSearchAuthorId] = useState<string>("");
  const [searchDynastyId, setSearchDynastyId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // 从 MDClassics 中获取作者和朝代数据
  const authors = MDClassics.authors;
  const dynasties = MDClassics.dynasties;

  useEffect(() => {
    // 初始化时设置正确的 pageSize
    const pageSize = getPageSize();
    if (MDClassics.pageSize !== pageSize) {
      NModel.dispatch(new NMDClassics.ARSetPageSize(pageSize));
    }
    loadAuthors();
    loadDynasties();
    reqGetList(true);
    setTimeout(() => {
      document.title = "名篇";
    });
  }, []);

  // 加载作者列表
  const loadAuthors = useCallback(async () => {
    // 防止重复加载
    if (loadingRef.current.authors) {
      return;
    }
    loadingRef.current.authors = true;
    NModel.dispatch(new NMDClassics.ARSetAuthorsLoading(true));
    try {
      const rsp = await SAuthor.getList({ pageSize: 10000 });
      if (rsp.success) {
        NModel.dispatch(new NMDClassics.ARSetAuthors(rsp.list));
      }
    } catch (error) {
      console.error("加载作者列表失败:", error);
    } finally {
      loadingRef.current.authors = false;
      NModel.dispatch(new NMDClassics.ARSetAuthorsLoading(false));
    }
  }, []);

  // 加载朝代列表
  const loadDynasties = useCallback(async () => {
    // 防止重复加载
    if (loadingRef.current.dynasties) {
      return;
    }
    loadingRef.current.dynasties = true;
    NModel.dispatch(new NMDClassics.ARSetDynastiesLoading(true));
    try {
      const rsp = await SDynasty.getList({ pageSize: 10000 });
      if (rsp.success) {
        NModel.dispatch(new NMDClassics.ARSetDynasties(rsp.list));
      }
    } catch (error) {
      console.error("加载朝代列表失败:", error);
    } finally {
      loadingRef.current.dynasties = false;
      NModel.dispatch(new NMDClassics.ARSetDynastiesLoading(false));
    }
  }, []);

  // 滚动加载 - 使用 window 滚动
  useEffect(() => {
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
          !MDClassics.loading &&
          MDClassics.hasMore
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
        !MDClassics.loading &&
        MDClassics.hasMore &&
        MDClassics.rsp.list.length > 0
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
    MDClassics.loading,
    MDClassics.hasMore,
    MDClassics.rsp.list.length,
    loadMore,
  ]);

  // 加载更多
  const loadMore = useCallback(async () => {
    if (MDClassics.loading || !MDClassics.hasMore) return;

    NModel.dispatch(new NMDClassics.ARSetLoading(true));
    try {
      const rsp = await SClassics.getList({
        authorId: searchAuthorId || undefined,
        dynastyId: searchDynastyId || undefined,
        page: MDClassics.page + 1,
        pageSize: MDClassics.pageSize,
      });

      if (rsp.success) {
        if (rsp.list.length > 0) {
          NModel.dispatch(new NMDClassics.ARAppendList(rsp.list));
          NModel.dispatch(new NMDClassics.ARSetPage(MDClassics.page + 1));
          NModel.dispatch(
            new NMDClassics.ARSetHasMore(rsp.list.length >= MDClassics.pageSize)
          );
        } else {
          NModel.dispatch(new NMDClassics.ARSetHasMore(false));
        }
      } else {
        message.error("加载失败");
      }
    } catch (error) {
      message.error("加载失败");
    } finally {
      NModel.dispatch(new NMDClassics.ARSetLoading(false));
    }
  }, [
    searchAuthorId,
    searchDynastyId,
    MDClassics.loading,
    MDClassics.hasMore,
    MDClassics.page,
    MDClassics.pageSize,
  ]);

  // 带参数的筛选函数
  const reqGetListWithFilters = useCallback(
    async (dynastyId: string, authorId: string) => {
      setLoading(true);
      try {
        const rsp = await SClassics.getList({
          authorId: authorId || undefined,
          dynastyId: dynastyId || undefined,
          page: 1,
          pageSize: MDClassics.pageSize,
        });

        if (rsp.success) {
          NModel.dispatch(new NMDClassics.ARSetRsp(rsp));
          NModel.dispatch(new NMDClassics.ARSetPage(1));
          NModel.dispatch(
            new NMDClassics.ARSetHasMore(rsp.list.length >= MDClassics.pageSize)
          );
        } else {
          message.error("加载失败");
        }
      } catch (error) {
        message.error("加载失败");
      } finally {
        setLoading(false);
      }
    },
    [MDClassics.pageSize]
  );

  const reqGetList = useCallback(
    async (shouldResetToFirst: boolean = false) => {
      setLoading(true);
      try {
        const rsp = await SClassics.getList({
          authorId: searchAuthorId || undefined,
          dynastyId: searchDynastyId || undefined,
          page: 1,
          pageSize: MDClassics.pageSize,
        });

        if (rsp.success) {
          NModel.dispatch(new NMDClassics.ARSetRsp(rsp));
          NModel.dispatch(new NMDClassics.ARSetPage(1));
          NModel.dispatch(
            new NMDClassics.ARSetHasMore(rsp.list.length >= MDClassics.pageSize)
          );
        } else {
          message.error("加载失败");
        }
      } catch (error) {
        message.error("加载失败");
      } finally {
        setLoading(false);
      }
    },
    [searchAuthorId, searchDynastyId, MDClassics.pageSize]
  );

  const handleEditOk = useCallback(
    async (shouldResetToFirst?: boolean, updatedClassic?: NClassics) => {
      await loadAuthors();
      await loadDynasties();
      // 如果是修改操作且提供了更新后的名篇数据，直接更新对应项，不重新加载分页
      if (updatedClassic && !shouldResetToFirst) {
        NModel.dispatch(new NMDClassics.ARUpdateItem(updatedClassic));
      } else {
        // 添加操作或需要重置时，重新加载分页数据
        reqGetList(shouldResetToFirst);
      }
    },
    [loadAuthors, loadDynasties, reqGetList]
  );

  const onAddClassic = useCallback(async () => {
    // 打开模态框前，确保作者和朝代数据是最新的
    await loadAuthors();
    await loadDynasties();
    editModalRef.current?.showModal();
  }, [loadAuthors, loadDynasties]);

  const onEditClassic = useCallback(
    async (classic: NClassics) => {
      // 打开模态框前，确保作者和朝代数据是最新的
      await loadAuthors();
      await loadDynasties();
      editModalRef.current?.showModal(classic);
    },
    [loadAuthors, loadDynasties]
  );

  // 复制名篇内容（包含标题、作者、朝代和内容，保留格式）
  const onCopyClassic = useCallback(
    (classic: NClassics) => {
      const author = authors.find((a) => a.id === classic.authorId);
      const dynastyName = author ? getDynastyName(author.id) : "";

      // 构建复制文本
      let textToCopy = "";

      // 标题
      if (classic.title) {
        textToCopy += classic.title + "\n";
      }

      // 作者和朝代
      if (author) {
        textToCopy += author.name;
        if (dynastyName) {
          textToCopy += `（${dynastyName}）`;
        }
        textToCopy += "\n";
      }

      // 内容（保留原始格式，按句号、感叹号、问号、分号和换行符分割）
      if (classic.content) {
        // 保留原始换行，同时按标点符号分割
        const sentences = classic.content
          .split(/[。！？；\n]+/)
          .filter((sentence) => sentence.trim())
          .map((sentence) => sentence.trim());
        textToCopy += sentences.join("\n");
      }

      // 使用 Clipboard API 复制文本
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(textToCopy)
          .then(() => {
            message.success("复制成功");
          })
          .catch((err) => {
            console.error("复制失败:", err);
            // 降级方案：使用传统方法
            fallbackCopyTextToClipboard(textToCopy);
          });
      } else {
        // 降级方案：使用传统方法
        fallbackCopyTextToClipboard(textToCopy);
      }
    },
    [authors, getDynastyName]
  );

  // 降级复制方案（兼容旧浏览器）
  const fallbackCopyTextToClipboard = useCallback((text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        message.success("复制成功");
      } else {
        message.error("复制失败");
      }
    } catch (err) {
      console.error("复制失败:", err);
      message.error("复制失败");
    }

    document.body.removeChild(textArea);
  }, []);

  const handleAuthorChange = useCallback(() => {
    authorManageModalRef.current?.showModal();
  }, []);

  // 作者管理模态框关闭后的回调，刷新作者和朝代列表
  const handleAuthorManageClose = useCallback(async () => {
    await loadAuthors();
    await loadDynasties();
  }, []);

  const handleDynastyChange = useCallback(() => {
    dynastyManageModalRef.current?.showModal();
  }, []);

  // 从 AuthorManageModal 打开 DynastyManageModal 的回调
  const handleDynastyChangeFromAuthor = useCallback(() => {
    dynastyManageModalRef.current?.showModal();
  }, []);

  // 朝代添加后的回调（从主页面打开朝代管理时调用）
  const handleDynastyAdded = useCallback(async () => {
    // 刷新主页面的朝代列表
    await loadDynasties();
  }, [loadDynasties]);

  // 从管理作者模态框打开朝代管理模态框，朝代添加后需要刷新管理作者中的朝代列表
  const handleDynastyAddedFromAuthor = useCallback(async () => {
    // 只刷新管理作者模态框中的朝代列表
    await authorManageModalRef.current?.refreshDynasties();
  }, []);

  // 作者添加后的回调
  const handleAuthorAdded = useCallback(async () => {
    await loadAuthors();
  }, []);

  // 获取作者对应的朝代名称
  const getDynastyName = useCallback(
    (authorId: string) => {
      const author = authors.find((a) => a.id === authorId);
      if (!author) return "";
      const dynasty = dynasties.find((d) => d.id === author.dynastyId);
      return dynasty ? dynasty.name : "";
    },
    [authors, dynasties]
  );

  const isMobile = Browser.isMobile();

  return (
    <div
      className={`${SelfStyle.classicsContainer} ${
        isMobile ? SelfStyle.mobile : ""
      }`}
    >
      {/* 搜索栏 */}
      <div className={SelfStyle.searchBar}>
        <Space wrap style={{ width: "100%" }}>
          <Select
            placeholder="选择朝代"
            value={searchDynastyId || undefined}
            onChange={(value) => {
              const newDynastyId = value || "";
              setSearchDynastyId(newDynastyId);
              setSearchAuthorId(""); // 改变朝代时清空作者选择
              // 直接使用新值调用，不等待状态更新
              reqGetListWithFilters(newDynastyId, "");
            }}
            allowClear
            showSearch
            style={{ width: isMobile ? "100%" : 200 }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={dynasties.map((dynasty) => ({
              label: dynasty.name,
              value: dynasty.id,
            }))}
          />
          <Select
            placeholder="选择作者"
            value={searchAuthorId || undefined}
            onChange={(value) => {
              const newAuthorId = value || "";
              setSearchAuthorId(newAuthorId);
              // 直接使用新值调用，不等待状态更新
              reqGetListWithFilters(searchDynastyId, newAuthorId);
            }}
            allowClear
            showSearch
            style={{ width: isMobile ? "100%" : 200 }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            key={searchDynastyId} // 添加 key 确保朝代变化时重新渲染
            options={authors
              .filter((author) => {
                // 如果选择了朝代，只显示该朝代的作者
                if (searchDynastyId) {
                  return author.dynastyId === searchDynastyId;
                }
                return true;
              })
              .map((author) => ({
                label: author.name,
                value: author.id,
              }))}
          />
          {(searchAuthorId || searchDynastyId) && (
            <Button
              onClick={() => {
                setSearchAuthorId("");
                setSearchDynastyId("");
                reqGetListWithFilters("", "");
              }}
            >
              重置
            </Button>
          )}
        </Space>
      </div>

      <div className={SelfStyle.contentContainer}>
        {MDClassics.rsp.list.length === 0 ? (
          <div className={SelfStyle.emptyState}>
            <p>暂无名篇，点击下方按钮添加第一篇吧！</p>
          </div>
        ) : (
          MDClassics.rsp.list.map((classic) => {
            const author = authors.find((a) => a.id === classic.authorId);
            const dynastyName = author ? getDynastyName(author.id) : "";

            // 操作菜单
            const menuItems: MenuProps["items"] = [
              {
                key: "copy",
                label: "复制",
                onClick: (e) => {
                  e?.domEvent?.stopPropagation();
                  onCopyClassic(classic);
                },
              },
              {
                key: "edit",
                label: "修改",
                onClick: (e) => {
                  e?.domEvent?.stopPropagation();
                  onEditClassic(classic);
                },
              },
              {
                key: "delete",
                label: "删除",
                danger: true,
                onClick: async (e) => {
                  e?.domEvent?.stopPropagation();
                  if (classic.id) {
                    const rsp = await SClassics.delItem(classic.id);
                    if (rsp.success) {
                      await reqGetList();
                    } else {
                      message.error(rsp.msg || "删除失败");
                    }
                  }
                },
              },
            ];

            return (
              <div key={classic.id} className={SelfStyle.classicItem}>
                <div className={SelfStyle.classicContent}>
                  {/* 右上角操作按钮 */}
                  <div className={SelfStyle.actionTrigger}>
                    <Dropdown
                      menu={{ items: menuItems }}
                      trigger={["hover"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className={SelfStyle.moreButton}
                      />
                    </Dropdown>
                  </div>

                  {/* 第一行：标题 */}
                  <div className={SelfStyle.title}>{classic.title}</div>

                  {/* 第二行：作者 */}
                  <div className={SelfStyle.author}>
                    {author
                      ? `${author.name}${
                          dynastyName ? `（${dynastyName}）` : ""
                        }`
                      : "未知作者"}
                  </div>

                  {/* 第三行：内容 - 一句话一行 */}
                  <div className={SelfStyle.content}>
                    {classic.content
                      .split(/[。！？；\n]+/)
                      .filter((sentence) => sentence.trim())
                      .map((sentence, index) => (
                        <p key={index}>{sentence.trim()}</p>
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* 加载更多提示 */}
        {MDClassics.loading && (
          <div className={SelfStyle.loadingMore}>加载中...</div>
        )}
        {!MDClassics.hasMore && MDClassics.rsp.list.length > 0 && (
          <div className={SelfStyle.noMore}>没有更多了</div>
        )}
      </div>

      <PageFooter>
        <Button onClick={onAddClassic} size={isMobile ? "small" : "middle"}>
          添加
        </Button>
      </PageFooter>

      <EditModal
        onOk={handleEditOk}
        ref={editModalRef}
        rsp={MDClassics.rsp}
        authors={authors}
        dynasties={dynasties}
        onAuthorChange={handleAuthorChange}
      />
      <AuthorManageModal
        ref={authorManageModalRef}
        onOk={handleAuthorAdded}
        onOpenDynastyModal={handleDynastyChangeFromAuthor}
        MDClassics={MDClassics}
      />
      <DynastyManageModal
        ref={dynastyManageModalRef}
        onOk={handleDynastyAdded}
        onDynastyAdded={handleDynastyAddedFromAuthor}
      />
    </div>
  );
};

export default connect(({ MDClassics }: NModel.IState) => ({
  MDClassics,
}))(PClassics);
