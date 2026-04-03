import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, ConnectRC } from "umi";
import { message, Spin, Modal, Input, Checkbox } from "antd";
import { LeftOutlined, RightOutlined, EditOutlined, CheckOutlined, CloseOutlined, TagsOutlined, DiffOutlined, RollbackOutlined } from "@ant-design/icons";
import SelfStyle from "./LNovel.less";
import NNovel from "./NNovel";
import SNovel from "./SNovel";
import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";
import UWsBridge from "@/common/utils/UWsBridge";
import wsEvent from "@/common/constants/wsEvent";

export interface NovelDetailProps { }

interface ParagraphDiffItem {
  paragraphIndex: number;
  paragraphNo: number;
  oldLineNo?: number | null;
  newLineNo?: number | null;
  changeType: "add" | "delete" | "modify";
  displayMode?: "inline" | "block";
  oldText: string;
  newText: string;
  oldLength: number;
  newLength: number;
  delta: number;
}

interface DiffToken {
  type: "equal" | "add" | "remove";
  text: string;
}

interface ParagraphItem {
  text: string;
  lineNo: number;
}

interface RenderRow {
  type: "paragraph" | "deleted";
  lineNo: number;
  paragraphIndex?: number;
  text?: string;
  changeItem?: ParagraphDiffItem;
}

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
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);
  const [editingLineText, setEditingLineText] = useState<string>("");
  const [savingLine, setSavingLine] = useState(false);
  const [diffOpen, setDiffOpen] = useState(false);
  const [diffLoading, setDiffLoading] = useState(false);
  const [paragraphDiffList, setParagraphDiffList] = useState<ParagraphDiffItem[]>([]);
  const [markedAt, setMarkedAt] = useState<string>("");
  const [activeDiffParagraph, setActiveDiffParagraph] = useState<number | null>(null);
  const [markedParagraphSet, setMarkedParagraphSet] = useState<Set<number>>(new Set());
  const [changedParagraphSet, setChangedParagraphSet] = useState<Set<number>>(new Set());
  const [selectedDiffParagraphSet, setSelectedDiffParagraphSet] = useState<Set<number>>(new Set());
  const [paragraphChangeMap, setParagraphChangeMap] = useState<Record<number, ParagraphDiffItem>>({});
  const [deletedChangeList, setDeletedChangeList] = useState<ParagraphDiffItem[]>([]);
  const editingTextAreaRef = useRef<any>(null);
  const currentChapterRef = useRef<number>(1);
  const novelPathRef = useRef<string>("");

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

  useEffect(() => {
    if (editingLineIndex === null) return;
    setTimeout(() => {
      const textarea = editingTextAreaRef.current?.resizableTextArea?.textArea as HTMLTextAreaElement | undefined;
      if (textarea) {
        textarea.focus();
        const len = textarea.value.length;
        textarea.setSelectionRange(len, len);
      }
    }, 0);
  }, [editingLineIndex]);

  useEffect(() => {
    currentChapterRef.current = currentChapter;
  }, [currentChapter]);

  useEffect(() => {
    novelPathRef.current = novel?.path || "";
  }, [novel?.path]);

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

  const getParagraphItems = useCallback((text: string): ParagraphItem[] => {
    const lines = String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
    const items: ParagraphItem[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() !== "") {
        items.push({ text: lines[i], lineNo: i + 1 });
      }
    }
    return items;
  }, []);

  // 计算从开头到指定段落索引的累计字数
  const calculateWordCount = useCallback((content: string, lineIndex: number): number => {
    if (!content) return 0;
    const lines = getParagraphItems(content).map((item) => item.text);
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
  }, [countTextLength, getParagraphItems]);

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
    return String(text).replace(/\r\n/g, "\n");
  }, []);

  const refreshParagraphMarkStatus = async (chapter: number) => {
    if (!novel?.path) {
      setMarkedParagraphSet(new Set());
      setChangedParagraphSet(new Set());
      return;
    }
    try {
      const result = await request({
        url: "/novel/getChapterParagraphDiff",
        method: "post",
        data: { path: novel.path, chapter },
      });
      if (result?.success) {
        const data = result.data || {};
        const markedIndexes = Array.isArray(data.markedParagraphIndexes) ? data.markedParagraphIndexes : [];
        const changes = Array.isArray(data.changes) ? data.changes : [];
        const changedIndexes = changes
          .map((item: ParagraphDiffItem) => (item.newLineNo ? item.newLineNo - 1 : item.paragraphIndex))
          .filter((idx: number) => idx >= 0);
        const changeMap: Record<number, ParagraphDiffItem> = {};
        const deletedChanges: ParagraphDiffItem[] = [];
        for (const changeItem of changes) {
          if (changeItem.changeType === "delete" && changeItem.oldLineNo) {
            deletedChanges.push(changeItem);
            continue;
          }
          const key = changeItem.newLineNo ? changeItem.newLineNo - 1 : changeItem.paragraphIndex;
          if (key >= 0) {
            changeMap[key] = changeItem;
          }
        }
        deletedChanges.sort((a, b) => Number(a.oldLineNo || 0) - Number(b.oldLineNo || 0));
        setMarkedParagraphSet(new Set(markedIndexes));
        setChangedParagraphSet(new Set(changedIndexes));
        setParagraphChangeMap(changeMap);
        setDeletedChangeList(deletedChanges);
        if (Array.isArray(data.debugTrace) && data.debugTrace.length > 0) {
          console.log("[章节对比映射]", data.debugTrace);
        }
      } else {
        setMarkedParagraphSet(new Set());
        setChangedParagraphSet(new Set());
        setParagraphChangeMap({});
        setDeletedChangeList([]);
      }
    } catch (error) {
      setMarkedParagraphSet(new Set());
      setChangedParagraphSet(new Set());
      setParagraphChangeMap({});
      setDeletedChangeList([]);
    }
  };

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
        const formattedContent = formatContent(result.data);
        setContent(formattedContent);
        setChapterWordCount(countTextLength(formattedContent));
        setEditingLineIndex(null);
        await updateReadingProgress(chapter);
        await refreshParagraphMarkStatus(chapter);
        if (contentWrapperRef.current) {
          contentWrapperRef.current.scrollTop = 0;
        }
      } else {
        if (result.success) {
          setContent("");
          setChapterWordCount(0);
          setEditingLineIndex(null);
          await updateReadingProgress(chapter);
          await refreshParagraphMarkStatus(chapter);
        } else {
          setContent("章节不存在或读取失败");
          setChapterWordCount(null);
          setMarkedParagraphSet(new Set());
          setChangedParagraphSet(new Set());
        }
      }
    } catch (error) {
      console.error("加载章节内容失败:", error);
      setContent("加载失败");
      setChapterWordCount(null);
      setEditingLineIndex(null);
      setMarkedParagraphSet(new Set());
      setChangedParagraphSet(new Set());
    } finally {
      setContentLoading(false);
      setTimeout(() => {
        if (contentWrapperRef.current) {
          contentWrapperRef.current.scrollTop = 0;
          contentWrapperRef.current.style.overflow = 'auto';
        }
        isSwitchingRef.current = false;
      }, 300);
    }
  };

  const refreshCurrentChapterContentSilently = useCallback(async () => {
    const currentPath = novelPathRef.current;
    if (!currentPath) return;
    const wrapper = contentWrapperRef.current;
    const prevScrollTop = wrapper ? wrapper.scrollTop : 0;
    try {
      const result = await request({
        url: "/novel/getChapterContent",
        method: "post",
        data: { path: currentPath, chapter: currentChapterRef.current },
      });
      if (result?.success) {
        const formattedContent = formatContent(result.data || "");
        setContent(formattedContent);
        setChapterWordCount(countTextLength(formattedContent));
        await refreshParagraphMarkStatus(currentChapterRef.current);
        if (wrapper) {
          wrapper.scrollTop = prevScrollTop;
        }
      }
    } catch (e) {}
  }, [countTextLength, formatContent, refreshParagraphMarkStatus]);


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

  const saveChapterContent = async (nextContent: string) => {
    if (!novel?.path) return false;
    const result = await request({
      url: "/novel/saveChapterContent",
      method: "post",
      data: {
        path: novel.path,
        chapter: currentChapter,
        content: nextContent,
      },
    });
    return !!result?.success;
  };

  const handleStartEditLine = (lineIndex: number, lineText: string) => {
    setEditingLineIndex(lineIndex);
    setEditingLineText(lineText);
  };

  const handleCancelEditLine = () => {
    setEditingLineIndex(null);
    setEditingLineText("");
  };

  const handleSaveEditLine = async () => {
    if (editingLineIndex === null) return;
    const normalizedContent = String(content || "").replace(/\r\n/g, "\n");
    const rawLines = normalizedContent.split("\n");
    const paragraphItems = getParagraphItems(normalizedContent);
    const targetParagraph = paragraphItems[editingLineIndex];
    if (!targetParagraph) return;
    const oldContent = String(content || "");
    rawLines[targetParagraph.lineNo - 1] = editingLineText;
    const nextContent = rawLines.join("\n");
    setSavingLine(true);
    setContent(nextContent);
    setChapterWordCount(countTextLength(nextContent));
    try {
      const success = await saveChapterContent(nextContent);
      if (!success) {
        setContent(oldContent);
        setChapterWordCount(countTextLength(oldContent));
        message.error("段落保存失败");
        return;
      }
      setEditingLineIndex(null);
      setEditingLineText("");
      await refreshParagraphMarkStatus(currentChapter);
      message.success("段落已保存");
    } catch (error) {
      setContent(oldContent);
      setChapterWordCount(countTextLength(oldContent));
      message.error("段落保存失败");
    } finally {
      setSavingLine(false);
    }
  };

  const markParagraphVersionInternal = async (lineIndex: number, showMessage = true) => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/markParagraphVersion",
        method: "post",
        data: { path: novel.path, chapter: currentChapter, paragraphIndex: lineIndex },
      });
      if (result?.success) {
        setMarkedParagraphSet((prev) => {
          const next = new Set(Array.from(prev));
          next.add(lineIndex);
          return next;
        });
        setChangedParagraphSet((prev) => {
          const next = new Set(Array.from(prev));
          next.delete(lineIndex);
          return next;
        });
        if (showMessage) {
        message.success("段落已标记");
        }
      } else {
        if (showMessage) {
          message.error(result?.msg || "段落标记失败");
        }
      }
    } catch (error) {
      if (showMessage) {
        message.error("段落标记失败");
      }
    }
  };

  const handleMarkParagraphVersion = async (lineIndex: number) => {
    await markParagraphVersionInternal(lineIndex, true);
  };

  const handleRevertParagraph = async (lineIndex: number) => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/revertParagraphToMark",
        method: "post",
        data: { path: novel.path, chapter: currentChapter, paragraphIndex: lineIndex },
      });
      if (result?.success) {
        const nextContent = String(result?.data?.content || "");
        setContent(nextContent);
        setChapterWordCount(countTextLength(nextContent));
        setEditingLineIndex(null);
        setEditingLineText("");
        await refreshParagraphMarkStatus(currentChapter);
        message.success("段落已撤回");
      } else {
        message.error(result?.msg || "段落撤回失败");
      }
    } catch (error) {
      message.error("段落撤回失败");
    }
  };

  const buildInlineDiffTokens = (oldText: string, newText: string): DiffToken[] => {
    const a = Array.from(String(oldText || ""));
    const b = Array.from(String(newText || ""));
    const n = a.length;
    const m = b.length;
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1;
        else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const tokens: DiffToken[] = [];
    let i = 0;
    let j = 0;
    const pushToken = (type: DiffToken["type"], ch: string) => {
      const last = tokens[tokens.length - 1];
      if (last && last.type === type) {
        last.text += ch;
      } else {
        tokens.push({ type, text: ch });
      }
    };
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        pushToken("equal", a[i]);
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        pushToken("remove", a[i]);
        i++;
      } else {
        pushToken("add", b[j]);
        j++;
      }
    }
    while (i < n) {
      pushToken("remove", a[i]);
      i++;
    }
    while (j < m) {
      pushToken("add", b[j]);
      j++;
    }
    return tokens;
  };

  const handleMarkCurrentChapter = async () => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/markChapterParagraphs",
        method: "post",
        data: { path: novel.path, chapter: currentChapter },
      });
      if (result?.success) {
        setMarkedAt(result?.data?.markedAt || "");
        await refreshParagraphMarkStatus(currentChapter);
        message.success("已标记当前章节");
      } else {
        message.error(result?.msg || "标记失败");
      }
    } catch (error) {
      message.error("标记失败");
    }
  };

  const handleOpenDiff = async (paragraphIndex?: number) => {
    if (!novel?.path) return;
    setDiffOpen(true);
    setDiffLoading(true);
    setActiveDiffParagraph(typeof paragraphIndex === "number" ? paragraphIndex : null);
    setSelectedDiffParagraphSet(new Set());
    try {
      const result = await request({
        url: "/novel/getChapterParagraphDiff",
        method: "post",
        data: { path: novel.path, chapter: currentChapter },
      });
      if (result?.success) {
        const data = result.data || {};
        const changes = Array.isArray(data.changes) ? data.changes : [];
        if (typeof paragraphIndex === "number") {
          setParagraphDiffList(changes.filter((item: ParagraphDiffItem) => item.paragraphIndex === paragraphIndex));
        } else {
          setParagraphDiffList(changes);
        }
        setMarkedAt(data.markedAt || "");
        if (Array.isArray(data.debugTrace) && data.debugTrace.length > 0) {
          console.log("[查看变更映射]", data.debugTrace);
        }
      } else {
        setParagraphDiffList([]);
        message.error(result?.msg || "读取对比失败");
      }
    } catch (error) {
      setParagraphDiffList([]);
      message.error("读取对比失败");
    } finally {
      setDiffLoading(false);
    }
  };

  const handleClearChapterMark = async () => {
    if (!novel?.path) return;
    try {
      const result = await request({
        url: "/novel/clearChapterMark",
        method: "post",
        data: { path: novel.path, chapter: currentChapter },
      });
      if (result?.success) {
        await refreshParagraphMarkStatus(currentChapter);
        setDiffOpen(false);
        message.success("已清空当前章节标记版本");
      } else {
        message.error(result?.msg || "清空标记失败");
      }
    } catch (error) {
      message.error("清空标记失败");
    }
  };

  const getBatchTargetParagraphIndexes = () => {
    if (activeDiffParagraph !== null) {
      return paragraphDiffList.map((item) => item.paragraphIndex);
    }
    return Array.from(selectedDiffParagraphSet);
  };

  const handleBatchMarkFromDiff = async () => {
    if (!novel?.path) return;
    const targets = getBatchTargetParagraphIndexes();
    if (targets.length === 0) {
      message.info("请先勾选要标记的段落");
      return;
    }
    try {
      const result = await request({
        url: "/novel/markParagraphsVersion",
        method: "post",
        data: { path: novel.path, chapter: currentChapter, paragraphIndexes: targets },
      });
      if (result?.success) {
        await refreshParagraphMarkStatus(currentChapter);
        await handleOpenDiff(activeDiffParagraph === null ? undefined : activeDiffParagraph);
        message.success("已标记选中段落");
      } else {
        message.error(result?.msg || "批量标记失败");
      }
    } catch (error) {
      message.error("批量标记失败");
    }
  };

  const handleBatchRevertFromDiff = async () => {
    if (!novel?.path) return;
    const targets = getBatchTargetParagraphIndexes();
    if (targets.length === 0) {
      message.info("请先勾选要撤回的段落");
      return;
    }
    try {
      const result = await request({
        url: "/novel/revertParagraphsToMark",
        method: "post",
        data: { path: novel.path, chapter: currentChapter, paragraphIndexes: targets },
      });
      if (result?.success) {
        const nextContent = String(result?.data?.content || "");
        setContent(nextContent);
        setChapterWordCount(countTextLength(nextContent));
        setEditingLineIndex(null);
        setEditingLineText("");
        await refreshParagraphMarkStatus(currentChapter);
        await handleOpenDiff(activeDiffParagraph === null ? undefined : activeDiffParagraph);
        message.success("已撤回选中段落");
      } else {
        message.error(result?.msg || "批量撤回失败");
      }
    } catch (error) {
      message.error("批量撤回失败");
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
    isSwitchingRef.current = false;
    setEditingLineIndex(null);
    setEditingLineText("");
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

  useEffect(() => {
    const off = UWsBridge.on(wsEvent.key.NOVEL, (payload) => {
      if (!payload) return;
      if (payload.type !== wsEvent.type.CHAPTER_FILE_CHANGED) return;
      if (!novelPathRef.current || payload.novelPath !== novelPathRef.current) return;
      if (Number(payload.chapter) !== Number(currentChapterRef.current)) return;
      refreshCurrentChapterContentSilently();
    });
    return () => {
      off();
    };
  }, [refreshCurrentChapterContentSilently]);

  useEffect(() => {
    const currentPath = novel?.path;
    return () => {
      if (!currentPath) return;
      request({
        url: "/novel/editNovel",
        method: "post",
        data: {
          watchAction: "close",
          path: currentPath,
        },
      }).catch(() => {});
    };
  }, [novel?.path]);



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
              (() => {
                const paragraphItems = getParagraphItems(content);
                const rows: RenderRow[] = [];
                const deletes = [...deletedChangeList];
                let di = 0;
                for (let i = 0; i < paragraphItems.length; i++) {
                  const paragraphItem = paragraphItems[i];
                  while (di < deletes.length && Number(deletes[di].oldLineNo || 0) <= paragraphItem.lineNo) {
                    rows.push({
                      type: "deleted",
                      lineNo: Number(deletes[di].oldLineNo || 0),
                      changeItem: deletes[di],
                    });
                    di++;
                  }
                  rows.push({
                    type: "paragraph",
                    lineNo: paragraphItem.lineNo,
                    paragraphIndex: i,
                    text: paragraphItem.text,
                  });
                }
                while (di < deletes.length) {
                  rows.push({
                    type: "deleted",
                    lineNo: Number(deletes[di].oldLineNo || 0),
                    changeItem: deletes[di],
                  });
                  di++;
                }
                return rows.map((row, rowIndex) => {
                if (row.type === "deleted") {
                  const changeItem = row.changeItem as ParagraphDiffItem;
                  return (
                    <div key={`deleted-${rowIndex}-${row.lineNo}`} className={SelfStyle.paragraphRow}>
                      <div className={SelfStyle.paragraphLeftPanel}>
                        <div className={SelfStyle.paragraphMetaRow}>
                          <span>{`${row.lineNo} 行 · ${rowIndex + 1} 段`}</span>
                          <span>{`共 ${countTextLength(changeItem.oldText || "").toLocaleString()} 字`}</span>
                        </div>
                      </div>
                      <p className={SelfStyle.changedSingleDelete}>{changeItem.oldText || "(已删除)"}</p>
                    </div>
                  );
                }
                const index = row.paragraphIndex as number;
                const line = row.text as string;
                const currentLineTotalWordCount = calculateWordCount(content, index);
                const rawLineIndex = row.lineNo - 1;
                const changedItem = paragraphChangeMap[rawLineIndex];
                const showChangedPreview = !!(changedParagraphSet.has(rawLineIndex) && changedItem);
                return (
                  <div
                    key={rowIndex}
                    className={SelfStyle.paragraphRow}
                  >
                    <div className={SelfStyle.paragraphLeftPanel}>
                      <div className={SelfStyle.paragraphMetaRow}>
                        <span>{`${row.lineNo} 行 · ${rowIndex + 1} 段`}</span>
                        <span>{`共 ${currentLineTotalWordCount.toLocaleString()} 字`}</span>
                      </div>
                      <div className={SelfStyle.paragraphActionRow}>
                        {showChangedPreview ? (
                          <>
                            <button
                              type="button"
                              className={SelfStyle.editLineButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkParagraphVersion(rawLineIndex);
                              }}
                            >
                              <TagsOutlined />
                            </button>
                            <button
                              type="button"
                              className={SelfStyle.editLineButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRevertParagraph(rawLineIndex);
                              }}
                            >
                              <RollbackOutlined />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className={SelfStyle.editLineButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditLine(index, line);
                              }}
                            >
                              <EditOutlined />
                            </button>
                            {!markedParagraphSet.has(rawLineIndex) && (
                              <button
                                type="button"
                                className={SelfStyle.editLineButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkParagraphVersion(rawLineIndex);
                                }}
                              >
                                <TagsOutlined />
                              </button>
                            )}
                            {markedParagraphSet.has(rawLineIndex) && changedParagraphSet.has(rawLineIndex) && (
                              <button
                                type="button"
                                className={SelfStyle.editLineButton}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDiff(rawLineIndex);
                                }}
                              >
                                <DiffOutlined />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    {editingLineIndex === index ? (
                      <div className={SelfStyle.editLineWrap}>
                        <Input.TextArea
                          ref={editingTextAreaRef}
                          value={editingLineText}
                          onChange={(e) => setEditingLineText(e.target.value)}
                          allowClear
                          autoSize={{ minRows: 2, maxRows: 8 }}
                        />
                        <div className={SelfStyle.editLineActions}>
                          <button type="button" onClick={handleCancelEditLine}><CloseOutlined /></button>
                          <button type="button" disabled={savingLine} onClick={handleSaveEditLine}>
                            {savingLine ? "..." : <CheckOutlined />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {showChangedPreview && changedItem.changeType === "add" ? (
                          <p className={SelfStyle.changedSingleAdd}>{changedItem.newText}</p>
                        ) : showChangedPreview && changedItem.changeType === "delete" ? (
                          <p className={SelfStyle.changedSingleDelete}>{changedItem.oldText}</p>
                        ) : showChangedPreview && changedItem.displayMode === "block" ? (
                          <div className={SelfStyle.changedPreviewWrap}>
                            <p className={SelfStyle.changedOldLine}>{changedItem.oldText}</p>
                            <p className={SelfStyle.changedNewLine}>{changedItem.newText}</p>
                          </div>
                        ) : showChangedPreview ? (
                          <p className={SelfStyle.contentLine}>
                            {buildInlineDiffTokens(changedItem.oldText, changedItem.newText).map((token, tokenIndex) => (
                              <span
                                key={`${rowIndex}-${tokenIndex}`}
                                className={
                                  token.type === "add"
                                    ? SelfStyle.inlineDiffAdd
                                    : token.type === "remove"
                                      ? SelfStyle.inlineDiffRemove
                                      : ""
                                }
                              >
                                {token.text}
                              </span>
                            ))}
                          </p>
                        ) : (
                          <p className={SelfStyle.contentLine}>{line}</p>
                        )}
                      </>
                    )}
                  </div>
                );
              });
              })()
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
        <button type="button" className={SelfStyle.wordStatTrigger} onClick={handleMarkCurrentChapter}>
          标记版本
        </button>
        <button type="button" className={SelfStyle.wordStatTrigger} onClick={handleOpenDiff}>
          查看变更
        </button>
        <button type="button" className={SelfStyle.wordStatTrigger} onClick={handleClearChapterMark}>
          清空标记
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
      <Modal
        title="段落变更对比"
        open={diffOpen}
        onCancel={() => setDiffOpen(false)}
        footer={null}
        width={900}
      >
        {diffLoading ? (
          <div className={SelfStyle.chapterWordStatsLoading}>
            <Spin />
          </div>
        ) : (
          <div className={SelfStyle.diffList}>
            <div className={SelfStyle.diffMeta}>
              {markedAt ? `基准标记时间：${markedAt}` : "未找到基准标记，请先点击“标记版本”"}
            </div>
            {activeDiffParagraph !== null && (
              <div className={SelfStyle.diffMeta}>{`仅查看第 ${activeDiffParagraph + 1} 段`}</div>
            )}
            {activeDiffParagraph === null && paragraphDiffList.length > 0 && (
              <div className={SelfStyle.diffCheckAllBar}>
                <Checkbox
                  checked={selectedDiffParagraphSet.size > 0 && selectedDiffParagraphSet.size === paragraphDiffList.length}
                  indeterminate={selectedDiffParagraphSet.size > 0 && selectedDiffParagraphSet.size < paragraphDiffList.length}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      setSelectedDiffParagraphSet(new Set(paragraphDiffList.map((item) => item.paragraphIndex)));
                    } else {
                      setSelectedDiffParagraphSet(new Set());
                    }
                  }}
                >
                  全选
                </Checkbox>
              </div>
            )}
            {paragraphDiffList.length === 0 ? (
              <div className={SelfStyle.noDiff}>没有段落变化</div>
            ) : (
              paragraphDiffList.map((item) => (
                <div key={`${item.paragraphNo}-${item.changeType}`} className={SelfStyle.diffItem}>
                  <div className={SelfStyle.diffHeader}>
                    <span>{`第 ${item.paragraphNo} 段`}</span>
                    {activeDiffParagraph === null && (
                      <Checkbox
                        checked={selectedDiffParagraphSet.has(item.paragraphIndex)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedDiffParagraphSet((prev) => {
                            const next = new Set(Array.from(prev));
                            if (checked) next.add(item.paragraphIndex);
                            else next.delete(item.paragraphIndex);
                            return next;
                          });
                        }}
                      />
                    )}
                  </div>
                  <div className={SelfStyle.diffBody}>
                    <div className={SelfStyle.diffLabel}>标记版本原文</div>
                    <div className={SelfStyle.inlineOriginText}>{item.oldText || "(空)"}</div>
                    <div className={SelfStyle.diffLabel}>基于标记版本的变化</div>
                    <div className={SelfStyle.inlineDiffText}>
                      {buildInlineDiffTokens(item.oldText, item.newText).map((token, tokenIndex) => (
                        <span
                          key={`${item.paragraphNo}-${tokenIndex}`}
                          className={
                            token.type === "add"
                              ? SelfStyle.inlineDiffAdd
                              : token.type === "remove"
                                ? SelfStyle.inlineDiffRemove
                                : ""
                          }
                        >
                          {token.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
            {paragraphDiffList.length > 0 && (
              <div className={SelfStyle.diffBottomBarSingle}>
                <button type="button" className={SelfStyle.diffMarkButton} onClick={handleBatchMarkFromDiff}>
                  标记为新版本
                </button>
                <button type="button" className={SelfStyle.diffRevertButton} onClick={handleBatchRevertFromDiff}>
                  撤回到标记版本
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NovelDetail;

