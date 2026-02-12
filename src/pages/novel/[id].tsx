import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, ConnectRC } from "umi";
import { message, Spin, Select, Tooltip } from "antd";
import SelfStyle from "./LNovel.less";
import NNovel from "./NNovel";
import SNovel from "./SNovel";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";

export interface NovelDetailProps {}

const NovelDetail: ConnectRC<NovelDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [novel, setNovel] = useState<NNovel | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState(false);
  const [chapterList, setChapterList] = useState<{ chapter: number; exists: boolean }[]>([]);
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const [nextChapterContent, setNextChapterContent] = useState<string>(""); // 预加载的下一章内容
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const isLoadingNextRef = useRef<boolean>(false); // 防止重复加载
  const isSwitchingRef = useRef<boolean>(false); // 是否正在切换章节
  const skipLoadRef = useRef<boolean>(false); // 是否跳过加载（使用预加载内容时）
  // 选择器显示状态：初始显示，3秒后自动隐藏
  const [showChapterSelector, setShowChapterSelector] = useState<boolean>(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false); // 选择器下拉菜单是否打开
  const lastScrollTopRef = useRef<number>(0); // 上次滚动位置
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // 自动隐藏定时器

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
    if (novel && currentChapter > 0) {
      // 如果使用预加载内容，跳过重新加载
      if (skipLoadRef.current) {
        skipLoadRef.current = false;
        return;
      }
      loadChapterContent(currentChapter);
    }
  }, [novel, currentChapter]);

  // 预加载下一章
  useEffect(() => {
    if (novel && currentChapter > 0 && chapterList.length > 0 && !contentLoading) {
      const maxChapter = Math.max(...chapterList.map(c => c.chapter));
      if (currentChapter < maxChapter && !nextChapterContent) {
        preloadNextChapter(currentChapter + 1);
      }
    }
  }, [novel, currentChapter, chapterList, nextChapterContent, contentLoading, preloadNextChapter]);

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
        // 直接使用 length 属性计算字数
        wordCount += line.length;
      }
    }
    
    return wordCount;
  }, []);

  // 预加载下一章内容
  const preloadNextChapter = useCallback(async (chapter: number) => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/getChapterContent",
        method: "post",
        data: { path: novel.path, chapter },
      });
      if (result.success && result.data) {
        // 格式化并保存预加载的内容
        const formattedContent = formatContent(result.data);
        setNextChapterContent(formattedContent);
      }
    } catch (error) {
      console.error("预加载下一章失败:", error);
    }
  }, [novel?.path, formatContent]);

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
        // 更新阅读进度
        await updateReadingProgress(chapter);
        // 滚动到顶部
        if (contentWrapperRef.current) {
          contentWrapperRef.current.scrollTop = 0;
        }
      } else {
        setContent("章节不存在或读取失败");
      }
    } catch (error) {
      console.error("加载章节内容失败:", error);
      setContent("加载失败");
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

  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextChapter = useCallback(() => {
    const maxChapter = chapterList.length > 0 ? Math.max(...chapterList.map(c => c.chapter)) : 0;
    if (currentChapter < maxChapter) {
      // 立即设置切换标志，阻止滚动事件处理
      isSwitchingRef.current = true;
      
      // 如果有预加载的内容，直接使用，不显示加载动画
      if (nextChapterContent) {
        skipLoadRef.current = true; // 设置标志，跳过 useEffect 中的加载
        
        // 隐藏滚动条
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.overflow = 'hidden';
        }
        
        setContent(nextChapterContent);
        setCurrentChapter(currentChapter + 1);
        updateReadingProgress(currentChapter + 1);
        setNextChapterContent(""); // 清空预加载内容，触发新的预加载
        
        // 立即滚动到顶部，使用多种方式确保生效
        if (contentWrapperRef.current) {
          contentWrapperRef.current.scrollTop = 0;
          // 使用 requestAnimationFrame 确保在下一帧执行，避免被用户滚动覆盖
          requestAnimationFrame(() => {
            if (contentWrapperRef.current) {
              contentWrapperRef.current.scrollTop = 0;
              // 再延迟一下，确保滚动位置固定，然后恢复滚动条
              setTimeout(() => {
                if (contentWrapperRef.current) {
                  contentWrapperRef.current.scrollTop = 0;
                  // 恢复滚动条
                  contentWrapperRef.current.style.overflow = 'auto';
                }
                isSwitchingRef.current = false;
              }, 100);
            }
          });
        } else {
          setTimeout(() => {
            isSwitchingRef.current = false;
          }, 100);
        }
      } else {
        // 没有预加载内容，正常加载
        // 隐藏滚动条
        if (contentWrapperRef.current) {
          contentWrapperRef.current.style.overflow = 'hidden';
        }
        setCurrentChapter(currentChapter + 1);
        // 延迟重置标志，等待加载完成后再恢复滚动条
        setTimeout(() => {
          if (contentWrapperRef.current) {
            contentWrapperRef.current.style.overflow = 'auto';
          }
          isSwitchingRef.current = false;
        }, 500);
      }
    }
  }, [currentChapter, chapterList, nextChapterContent]);

  const handleChapterChange = (chapter: number) => {
    // 通过选择器切换章节时，清空预加载的内容（因为预加载的是旧章节的下一章）
    setNextChapterContent("");
    // 重置切换标志
    isSwitchingRef.current = false;
    skipLoadRef.current = false;
    setCurrentChapter(chapter);
    if (contentWrapperRef.current) {
      contentWrapperRef.current.scrollTop = 0;
    }
  };

  // 初始显示3秒后自动隐藏，以及当选择器显示时自动启动3秒隐藏定时器
  useEffect(() => {
    // 如果选择器下拉菜单打开，不执行自动隐藏
    if (isSelectorOpen) {
      // 清除定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      return;
    }

    // 如果选择器显示，启动3秒后自动隐藏
    if (showChapterSelector) {
      // 清除之前的定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      // 3秒后自动隐藏
      hideTimerRef.current = setTimeout(() => {
        setShowChapterSelector(false);
        hideTimerRef.current = null;
      }, 3000);
    } else {
      // 如果选择器隐藏，清除定时器
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    }
    
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [showChapterSelector, isSelectorOpen]);

  // 滚动到底部自动加载下一章 + PC端和移动端统一的选择器显示/隐藏控制
  useEffect(() => {
    const wrapper = contentWrapperRef.current;
    if (!wrapper) return;

    // 初始化滚动位置
    lastScrollTopRef.current = wrapper.scrollTop;

    const handleScroll = () => {
      const scrollTop = wrapper.scrollTop;
      const scrollHeight = wrapper.scrollHeight;
      const clientHeight = wrapper.clientHeight;
      
      // PC端和移动端统一逻辑：控制选择器显示/隐藏
      // 如果选择器下拉菜单打开，不执行自动隐藏逻辑
      if (!isSelectorOpen) {
        const scrollDelta = scrollTop - lastScrollTopRef.current;
        const scrollThreshold = 10; // 滚动阈值，避免微小滚动触发
        
        if (Math.abs(scrollDelta) > scrollThreshold) {
          // 清除之前的定时器
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
          
          if (scrollDelta > 0) {
            // 向下滚动，立即隐藏选择器
            setShowChapterSelector(false);
          } else {
            // 向上滚动，显示选择器
            setShowChapterSelector(true);
            // 3秒后自动隐藏（由上面的useEffect处理）
          }
          
          lastScrollTopRef.current = scrollTop;
        }
      }

      // 如果正在加载或切换，或选择器下拉菜单打开，不处理自动加载下一章
      if (isLoadingNextRef.current || contentLoading || isSwitchingRef.current || isSelectorOpen) return;

      // 检查是否真正滚动到底部（只有真正到底部才切换，避免还没看完就切换）
      const threshold = 10; // 距离底部10px内才触发（真正到底部）

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        // 检查是否还有下一章
        const maxChapter = chapterList.length > 0 ? Math.max(...chapterList.map(c => c.chapter)) : 0;
        if (currentChapter < maxChapter) {
          isLoadingNextRef.current = true;
          handleNextChapter();
          // 延迟重置标记
          setTimeout(() => {
            isLoadingNextRef.current = false;
          }, 1000);
        }
      }
    };

    wrapper.addEventListener('scroll', handleScroll);
    return () => {
      wrapper.removeEventListener('scroll', handleScroll);
    };
  }, [currentChapter, chapterList, contentLoading, handleNextChapter, isSelectorOpen]);

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

  return (
    <div className={SelfStyle.detailContainer}>
      <div className={SelfStyle.contentWrapper} ref={contentWrapperRef}>
        {contentLoading ? (
          <div className={SelfStyle.loadingWrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <div className={SelfStyle.content}>
            {content ? (
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
            ) : (
              <p>加载中...</p>
            )}
          </div>
        )}
      </div>

      {/* 悬浮在右侧的章节选择器 */}
      <div className={`${SelfStyle.floatingChapterSelector} ${showChapterSelector ? SelfStyle.visible : SelfStyle.hidden}`}>
        <Select
          value={currentChapter}
          onChange={handleChapterChange}
          style={{ width: 140 }}
          showSearch
          optionLabelProp="label"
          onDropdownVisibleChange={(open) => {
            setIsSelectorOpen(open);
            if (open) {
              // 下拉菜单打开时，清除自动隐藏定时器，并确保选择器显示
              if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
              }
              setShowChapterSelector(true);
            }
            // 下拉菜单关闭时，选择器继续保持显示，由上面的useEffect处理3秒后自动隐藏
          }}
          filterOption={(input, option) => {
            const searchText = input.toLowerCase();
            const optionValue = option?.value;
            
            // 直接匹配章节号
            if (/^\d+$/.test(searchText)) {
              const chapterNum = parseInt(searchText, 10);
              return optionValue === chapterNum;
            }
            
            return false;
          }}
          className={SelfStyle.chapterSelect}
          getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
        >
          {Array.from({ length: maxChapter }, (_, i) => i + 1).map((ch) => (
            <Select.Option key={ch} value={ch} label={`${ch} / ${maxChapter}`}>
              {ch}
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default NovelDetail;

