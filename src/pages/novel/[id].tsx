import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, ConnectRC } from "umi";
import { message, Spin, Tooltip, Modal, Input } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import SelfStyle from "./LNovel.less";
import NNovel from "./NNovel";
import SNovel from "./SNovel";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export interface NovelDetailProps { }

const NovelDetail: ConnectRC<NovelDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [novel, setNovel] = useState<NNovel | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState(false);
  const [chapterList, setChapterList] = useState<{ chapter: number; name?: string; exists: boolean }[]>([]);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const isSwitchingRef = useRef<boolean>(false); // 是否正在切换章节
  const lastScrollTopRef = useRef<number>(0); // 上次滚动位置
  const [chapterWordCount, setChapterWordCount] = useState<number | null>(null);
  const [totalWordCount, setTotalWordCount] = useState<number | null>(null);
  const [chapterWordStatsOpen, setChapterWordStatsOpen] = useState(false);
  const [chapterWordStatsLoading, setChapterWordStatsLoading] = useState(false);
  const [chapterWordStats, setChapterWordStats] = useState<{ chapter: number; name?: string; wordCount: number }[]>([]);
  const [chapterWordStatsSearchText, setChapterWordStatsSearchText] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadNovel();
    }
  }, [id]);

  useEffect(() => {
    if (novel && novel.path) {
      loadChapterList();
    }
  }, [novel]);

  useEffect(() => {
    if (novel?.path) {
      loadNovelWordCount();
    } else {
      setTotalWordCount(null);
      setChapterWordStats([]);
    }
  }, [novel?.path]);

  useEffect(() => {
    if (novel && currentChapter > 0) {
      loadChapterContent(currentChapter);
    }
  }, [novel, currentChapter]);

  const loadNovel = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const result = await SNovel.getItem(id);
      if (result.success && result.data) {
        const novelData = result.data;
        setNovel(novelData);
        // 设置当前章节（如果没有则默认1）
        setCurrentChapter(novelData.currentChapter || 1);
      } else {
        message.error("加载小说信息失败");
      }
    } catch (error) {
      console.error("加载小说信息失败:", error);
      message.error("加载小说信息失败");
    } finally {
      setLoading(false);
    }
  };

  const countTextLength = useCallback((text: string): number => {
    if (!text || typeof text !== 'string') return 0;
    return text.replace(/\s/g, "").length;
  }, []);

  // 计算从开头到指定段落索引的累计字数
  const calculateWordCount = useCallback((content: string, lineIndex: number): number => {
    if (!content) return 0;
    const lines = content.split('\n');
    let wordCount = 0;

    // 计算从开头到当前段落（包含当前段落）的所有字数
    // 直接使用 length 属性累加每段的内容
    for (let i = 0; i <= lineIndex && i < lines.length; i++) {
      const line = lines[i];
      if (line) {
        wordCount += countTextLength(line);
      }
    }

    return wordCount;
  }, [countTextLength]);

  const loadChapterList = async () => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/getChapterList",
        method: "post",
        data: { path: novel.path },
      });
      if (result.success && result.data) {
        setChapterList(result.data);
      }
    } catch (error) {
      console.error("加载章节列表失败:", error);
    }
  };

  const loadNovelWordCount = async () => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/getNovelWordCount",
        method: "post",
        data: { path: novel.path },
      });
      if (result.success && result.data) {
        setTotalWordCount(result.data.totalWordCount);
      } else {
        setTotalWordCount(null);
      }
    } catch (error) {
      console.error("加载小说总字数失败:", error);
      setTotalWordCount(null);
    }
  };

  const loadChapterWordStats = async () => {
    if (!novel?.path) return;
    setChapterWordStatsLoading(true);
    try {
      const result = await request({
        url: "/novel/getChapterWordStats",
        method: "post",
        data: { path: novel.path },
      });
      if (result.success && result.data?.chapterWordStats) {
        setChapterWordStats(result.data.chapterWordStats);
      } else {
        setChapterWordStats([]);
        message.error("加载章节字数统计失败");
      }
    } catch (error) {
      console.error("加载章节字数统计失败:", error);
      setChapterWordStats([]);
      message.error("加载章节字数统计失败");
    } finally {
      setChapterWordStatsLoading(false);
    }
  };

  const handleOpenChapterWordStats = async () => {
    setChapterWordStatsOpen(true);
    
    const scrollToCurrent = () => {
      setTimeout(() => {
        const activeItem = document.querySelector(`.${SelfStyle.currentChapterWordStatsItem}`);
        if (activeItem) {
          activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    if (chapterWordStats.length === 0) {
      await loadChapterWordStats();
      // 等待数据加载并渲染完成后再滚动
      setTimeout(scrollToCurrent, 100);
    } else {
      scrollToCurrent();
    }
  };

  // 格式化文本内容：保留原始格式，不做自动分段和排版
  const formatContent = useCallback((text: string): string => {
    if (!text) return "";
    return text;
  }, []);

  const loadChapterContent = async (chapter: number) => {
    if (!novel?.path) return;
    setContentLoading(true);
    isSwitchingRef.current = true;

    // 隐藏滚动条
    if (contentWrapperRef.current) {
      contentWrapperRef.current.style.overflow = 'hidden';
    }

    try {
      const result = await request({
        url: "/novel/getChapterContent",
        method: "post",
        data: { path: novel.path, chapter },
      });
      if (result.success && result.data) {
        // 格式化内容
        const formattedContent = formatContent(result.data);
        setContent(formattedContent);
        setChapterWordCount(countTextLength(formattedContent));
        // 更新阅读进度
        await updateReadingProgress(chapter);
        // 滚动到顶部
        if (contentWrapperRef.current) {
          contentWrapperRef.current.scrollTop = 0;
        }
      } else {
        // 后端返回成功，但没有数据，说明可能是空白章节
        if (result.success) {
          setContent(""); // 展示为空
          setChapterWordCount(0);
          await updateReadingProgress(chapter);
        } else {
          setContent("章节不存在或读取失败");
          setChapterWordCount(null);
        }
      }
    } catch (error) {
      console.error("加载章节内容失败:", error);
      setContent("加载失败");
      setChapterWordCount(null);
    } finally {
      setContentLoading(false);
      // 延迟重置切换标记，避免滚动事件立即触发
      setTimeout(() => {
        // 确保滚动到顶部，然后恢复滚动条
        if (contentWrapperRef.current) {
          contentWrapperRef.current.scrollTop = 0;
          // 恢复滚动条
          contentWrapperRef.current.style.overflow = 'auto';
        }
        isSwitchingRef.current = false;
      }, 300);
    }
  };


  const updateReadingProgress = async (chapter: number) => {
    if (!novel?.id) return;
    try {
      await SNovel.editItem({
        ...novel,
        currentChapter: chapter,
      });
    } catch (error) {
      console.error("更新阅读进度失败:", error);
    }
  };

  const handlePrevChapter = useCallback(() => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      if (contentWrapperRef.current) {
        contentWrapperRef.current.scrollTop = 0;
      }
    }
  }, [currentChapter]);

  const handleNextChapter = useCallback(() => {
    const maxChapter = chapterList.length > 0 ? Math.max(...chapterList.map(c => c.chapter)) : 0;
    if (currentChapter < maxChapter) {
      // 立即设置切换标志，阻止滚动事件处理
      isSwitchingRef.current = true;
      if (contentWrapperRef.current) {
        contentWrapperRef.current.style.overflow = 'hidden';
      }
      setCurrentChapter(currentChapter + 1);
      setTimeout(() => {
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.overflow = 'auto';
        }
        isSwitchingRef.current = false;
      }, 500);
    }
  }, [currentChapter, chapterList]);

  const handleChapterChange = (chapter: number) => {
    // 重置切换标志
    isSwitchingRef.current = false;
    setCurrentChapter(chapter);
    if (contentWrapperRef.current) {
      contentWrapperRef.current.scrollTop = 0;
    }
  };

  // 键盘事件监听：左右箭头键切换章节
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) {
        return;
      }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;
      const code = e.code;
      const keyCode = e.keyCode;

      const isLeft = key === 'ArrowLeft' || code === 'ArrowLeft' || keyCode === 37 || key === 'a' || key === 'A' || code === 'KeyA';
      const isRight = key === 'ArrowRight' || code === 'ArrowRight' || keyCode === 39 || key === 'd' || key === 'D' || code === 'KeyD';

      if (isLeft) {
        e.preventDefault();
        handlePrevChapter();
        return;
      }

      if (isRight) {
        e.preventDefault();
        handleNextChapter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handlePrevChapter, handleNextChapter]);



  if (loading) {
    return (
      <div className={SelfStyle.detailContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className={SelfStyle.detailContainer}>
        <p>小说不存在</p>
      </div>
    );
  }

  const maxChapter = chapterList.length > 0 ? Math.max(...chapterList.map(c => c.chapter)) : 0;
  const currentChapterItem = chapterList.find((item) => item.chapter === currentChapter);
  const currentChapterText = currentChapterItem?.name || `第 ${currentChapter} 章`;
  const chapterWordCountText = chapterWordCount === null ? "统计中..." : `${chapterWordCount.toLocaleString()} 字`;
  const totalWordCountText = totalWordCount === null ? "统计中..." : `${totalWordCount.toLocaleString()}`;

  const filteredChapterWordStats = chapterWordStats.filter((item) => {
    if (!chapterWordStatsSearchText) return true;
    
    const searchText = chapterWordStatsSearchText.trim();
    const label = String(item.name || "");

    // 1. 如果是纯数字，匹配最终次序（Sequnece Number）
    if (/^\d+$/.test(searchText)) {
      const chapterNum = parseInt(searchText, 10);
      return item.chapter === chapterNum;
    }

    // 2. 精准匹配标识符部分（Folder-File）
    const lastHyphenIndex = label.lastIndexOf('-');
    if (lastHyphenIndex !== -1) {
      const nameIdentifier = label.substring(0, lastHyphenIndex);
      return nameIdentifier === searchText;
    }

    return false;
  });

  return (
    <div className={SelfStyle.detailContainer}>
      <div className={SelfStyle.contentWrapper} ref={contentWrapperRef}>
        {contentLoading ? (
          <div className={SelfStyle.loadingWrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <div className={SelfStyle.content}>
            {content && typeof content === 'string' ? (
              content.split('\n').map((line, index) => {
                if (line.trim()) {
                  const wordCount = calculateWordCount(content, index);
                  return (
                    <Tooltip
                      key={index}
                      title={`共 ${wordCount.toLocaleString()} 字`}
                      placement="top"
                      mouseEnterDelay={0.3}
                    >
                      <p className={SelfStyle.contentLine}>{line}</p>
                    </Tooltip>
                  );
                } else {
                  return <br key={index} />;
                }
              })
            ) : content === "" ? (
              <p>（本章暂无内容）</p>
            ) : (
              <p>加载中...</p>
            )}
          </div>
        )}
      </div>

      <div className={SelfStyle.bottomInfoBar}>
        <span>{`${currentChapterText}章`}</span>
        <span>{`${chapterWordCountText}`}</span>
        <button type="button" className={SelfStyle.wordStatTrigger} onClick={handleOpenChapterWordStats}>
          {`总字数 ${totalWordCountText}`}
        </button>
        <div className={SelfStyle.chapterNavIcons}>
          <LeftOutlined 
            className={`${SelfStyle.navIcon} ${currentChapter <= 1 ? SelfStyle.disabled : ''}`} 
            onClick={currentChapter > 1 ? handlePrevChapter : undefined} 
          />
          <RightOutlined 
            className={`${SelfStyle.navIcon} ${currentChapter >= maxChapter ? SelfStyle.disabled : ''}`} 
            onClick={currentChapter < maxChapter ? handleNextChapter : undefined} 
          />
        </div>
      </div>
      <Modal
        title={
          <div className={SelfStyle.modalTitle}>
            <span>章节字数统计</span>
            <Input
              placeholder="搜索章节..."
              allowClear
              onChange={(e) => setChapterWordStatsSearchText(e.target.value)}
              style={{ width: 200 }}
            />
          </div>
        }
        open={chapterWordStatsOpen}
        onCancel={() => setChapterWordStatsOpen(false)}
        footer={null}
        width={720}
        destroyOnClose={false}
      >
        {chapterWordStatsLoading ? (
          <div className={SelfStyle.chapterWordStatsLoading}>
            <Spin />
          </div>
        ) : (
          <div className={SelfStyle.chapterWordStatsList}>
            {filteredChapterWordStats.map((item) => (
              <div
                key={item.chapter}
                className={`${SelfStyle.chapterWordStatsItem} ${item.chapter === currentChapter ? SelfStyle.currentChapterWordStatsItem : ""}`}
                onClick={() => {
                  setChapterWordStatsOpen(false);
                  handleChapterChange(item.chapter);
                }}
              >
                <span>{item.name || `第 ${item.chapter} 章`}</span>
                <span className={item.wordCount < 2000 ? SelfStyle.shortChapterWordCount : ""}>
                  {item.wordCount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NovelDetail;

