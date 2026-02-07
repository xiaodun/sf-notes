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

  // 格式化文本内容：先按换行分割，再处理引号对，引号对作为整体，引号内的标点不触发句子分割
  const formatContent = useCallback((text: string): string => {
    if (!text) return "";
    
    // 移除多余的空白字符
    let formatted = text.trim();
    
    // 移除多余的连续空格，但保留单个空格
    formatted = formatted.replace(/[ \t]+/g, " ");
    
    // 移除全角空格（不需要缩进）
    formatted = formatted.replace(/　+/g, " ");
    
    // 第一步：先按换行符分割成行（保留原始分段）
    const originalLines = formatted.split(/\r?\n/);
    const resultLines: string[] = [];
    
    for (const line of originalLines) {
      if (!line.trim()) {
        // 保留空行作为段落分隔
        resultLines.push("");
        continue;
      }
      
      // 第二步：对每一行处理引号对和【】对
      const quoteMap = new Map<string, string>();
      const bracketMap = new Map<string, string>(); // 单独存储【】对的占位符
      let quoteIndex = 0;
      let bracketIndex = 0;
      let processedLine = "";
      let i = 0;
      
      // 处理引号对和【】对，使用占位符替换
      while (i < line.length) {
        const char = line[i];
        
        // 检查是否是中文开引号 " 或 '（使用字符码匹配）
        if (char === '\u201c' || char === '\u2018') {
          const closeQuote = char === '\u201c' ? '\u201d' : '\u2019';
          // 寻找匹配的闭引号
          let quoteEndIndex = -1;
          let j = i + 1;
          
          while (j < line.length) {
            if (line[j] === closeQuote) {
              quoteEndIndex = j;
              break;
            }
            j++;
          }
          
          if (quoteEndIndex !== -1) {
            // 找到匹配的闭引号，提取引号对
            const quoteContent = line.substring(i + 1, quoteEndIndex);
            // 将引号内的所有换行、制表符、多余空格压缩为单个空格
            const cleanedContent = quoteContent.replace(/[\s\n\r\t]+/g, " ").trim();
            const cleanedQuote = char + cleanedContent + closeQuote;
            const placeholder = `__QUOTE_${quoteIndex}__`;
            
            quoteMap.set(placeholder, cleanedQuote);
            processedLine += placeholder;
            i = quoteEndIndex + 1;
            quoteIndex++;
            continue;
          }
        }
        // 检查是否是英文开引号 " 或 '
        else if (char === '"' || char === "'") {
          // 寻找匹配的闭引号（英文引号可能相同或不同）
          let quoteEndIndex = -1;
          let j = i + 1;
          
          while (j < line.length) {
            if (line[j] === char || line[j] === '"' || line[j] === "'") {
              // 简单匹配：如果是相同的引号字符，可能是闭引号
              quoteEndIndex = j;
              break;
            }
            j++;
          }
          
          if (quoteEndIndex !== -1) {
            // 找到匹配的闭引号，提取引号对
            const quoteContent = line.substring(i + 1, quoteEndIndex);
            // 将引号内的所有换行、制表符、多余空格压缩为单个空格
            const cleanedContent = quoteContent.replace(/[\s\n\r\t]+/g, " ").trim();
            const cleanedQuote = char + cleanedContent + line[quoteEndIndex];
            const placeholder = `__QUOTE_${quoteIndex}__`;
            
            quoteMap.set(placeholder, cleanedQuote);
            processedLine += placeholder;
            i = quoteEndIndex + 1;
            quoteIndex++;
            continue;
          }
        }
        // 检查是否是【
        else if (char === '【') {
          // 寻找匹配的】
          let bracketEndIndex = -1;
          let j = i + 1;
          
          while (j < line.length) {
            if (line[j] === '】') {
              bracketEndIndex = j;
              break;
            }
            j++;
          }
          
          if (bracketEndIndex !== -1) {
            // 找到匹配的】，提取【】对
            const bracketContent = line.substring(i + 1, bracketEndIndex);
            // 将【】内的所有换行、制表符、多余空格压缩为单个空格
            const cleanedContent = bracketContent.replace(/[\s\n\r\t]+/g, " ").trim();
            const cleanedBracket = '【' + cleanedContent + '】';
            const placeholder = `__BRACKET_${bracketIndex}__`; // 使用不同的占位符标识
            
            bracketMap.set(placeholder, cleanedBracket);
            processedLine += placeholder;
            i = bracketEndIndex + 1;
            bracketIndex++;
            continue;
          }
        }
        
        // 不是引号或【】，直接添加字符
        processedLine += char;
        i++;
      }
      
      // 第三步：按句子分割（占位符不会被分割，占位符内的标点不会触发分割）
      const sentenceLines: string[] = [];
      let currentSentence = "";
      let j = 0;
      
      while (j < processedLine.length) {
        // 检查是否是【】占位符开始
        if (processedLine.substring(j).startsWith('__BRACKET_')) {
          // 收集所有连续的【】占位符（紧挨着或只有空白分隔）
          const consecutiveBrackets: string[] = [];
          let currentPos = j;
          
          while (currentPos < processedLine.length) {
            // 检查当前位置是否是【】占位符开始
            if (!processedLine.substring(currentPos).startsWith('__BRACKET_')) {
              break;
            }
            
            // 找到【】占位符的结束位置
            const endIndex = processedLine.indexOf('__', currentPos + 11);
            if (endIndex !== -1) {
              const placeholder = processedLine.substring(currentPos, endIndex + 2);
              consecutiveBrackets.push(placeholder);
              currentPos = endIndex + 2;
              // 跳过空白，检查下一个是否是【】占位符
              const savedPos = currentPos;
              while (currentPos < processedLine.length && /\s/.test(processedLine[currentPos])) {
                currentPos++;
              }
              // 如果跳过空白后不是【】占位符，停止收集
              if (!processedLine.substring(currentPos).startsWith('__BRACKET_')) {
                currentPos = savedPos; // 恢复位置，包括空白
                break;
              }
            } else {
              break;
            }
          }
          
          // 如果连续有多个【】，每个【】单独成行
          if (consecutiveBrackets.length > 1) {
            // 如果当前句子不为空，先保存前面的内容
            if (currentSentence.trim()) {
              sentenceLines.push(currentSentence.trim());
              currentSentence = "";
            }
            // 每个【】占位符单独成行
            consecutiveBrackets.forEach(placeholder => {
              sentenceLines.push(placeholder);
            });
            j = currentPos;
            continue;
          } else if (consecutiveBrackets.length === 1) {
            // 如果只有一个【】，和前后内容一起，作为句子的一部分（不单独成行）
            currentSentence += consecutiveBrackets[0];
            j = currentPos;
            continue;
          }
        }
        // 检查是否是引号占位符开始（引号和前后内容一起）
        else if (processedLine.substring(j).startsWith('__QUOTE_')) {
          // 找到占位符的结束位置
          const endIndex = processedLine.indexOf('__', j + 9);
          if (endIndex !== -1) {
            const placeholder = processedLine.substring(j, endIndex + 2);
            // 获取引号占位符对应的实际内容，检查是否以句号结尾
            const quoteContent = quoteMap.get(placeholder) || '';
            const endsWithPunctuation = /[。！？]$/.test(quoteContent);
            
            // 引号占位符和前后内容一起，作为句子的一部分（不单独成行）
            currentSentence += placeholder;
            j = endIndex + 2;
            
            // 如果引号内容以句号结尾，检查后面是什么
            if (endsWithPunctuation && j < processedLine.length) {
              // 检查后面是否是另一个占位符
              const isNextPlaceholder = processedLine.substring(j).startsWith('__QUOTE_') || 
                                       processedLine.substring(j).startsWith('__BRACKET_');
              
              if (isNextPlaceholder) {
                // 后面是另一个占位符，继续累积（连续引号对话应该在一起）
                continue;
              } else {
                // 后面是普通文本，说明引号对话已经结束，应该分割
                // 保存当前句子（包含所有连续的引号）
                if (currentSentence.trim()) {
                  sentenceLines.push(currentSentence.trim());
                  currentSentence = "";
                }
                // 不 continue，继续 while 循环处理后续字符（j 已经指向普通文本）
                // 会继续到下面的字符处理逻辑
              }
            } else {
              // 如果引号不以句号结尾，或者已经到行尾，继续循环
              continue;
            }
          } else {
            // 找不到结束位置，跳过当前字符
            currentSentence += processedLine[j];
            j++;
            continue;
          }
        }
        
        // 处理普通字符
        const char = processedLine[j];
        currentSentence += char;
        
        // 如果遇到标点符号（且不在占位符内），结束当前句子
        // 注意：省略号 … 不触发句子分割，因为它不应该单独成行
        if (/[。！？；：]/.test(char)) {
          if (currentSentence.trim()) {
            sentenceLines.push(currentSentence.trim());
            currentSentence = "";
          }
        }
        
        j++;
      }
      
      // 添加剩余的句子
      if (currentSentence.trim()) {
        sentenceLines.push(currentSentence.trim());
      }
      
      // 如果没有生成任何行，整个行作为一行
      if (sentenceLines.length === 0) {
        sentenceLines.push(processedLine.trim());
      }
      
      // 恢复所有占位符（引号和【】）
      let finalSentenceLines = sentenceLines.map(sentence => {
        let restoredSentence = sentence;
        // 先恢复【】占位符
        bracketMap.forEach((bracket, placeholder) => {
          restoredSentence = restoredSentence.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), bracket);
        });
        // 再恢复引号占位符
        quoteMap.forEach((quote, placeholder) => {
          restoredSentence = restoredSentence.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), quote);
        });
        return restoredSentence;
      });
      
      // 后处理：检查每个句子，如果引号后面直接跟着普通文本，进行分割
      const postProcessedLines: string[] = [];
      for (const line of finalSentenceLines) {
        // 使用字符遍历查找引号对
        const splits: number[] = [0];
        let i = 0;
        
        while (i < line.length) {
          const char = line[i];
          
          // 检查是否是中文开引号 " 或 '
          if (char === '\u201c' || char === '\u2018') {
            const closeQuote = char === '\u201c' ? '\u201d' : '\u2019';
            // 寻找匹配的闭引号
            let quoteEndIndex = -1;
            let j = i + 1;
            
            while (j < line.length) {
              if (line[j] === closeQuote) {
                quoteEndIndex = j;
                break;
              }
              j++;
            }
            
            if (quoteEndIndex !== -1) {
              // 找到匹配的闭引号，检查引号内容是否以句号结尾
              const quoteContent = line.substring(i + 1, quoteEndIndex);
              const endsWithPunctuation = /[。！？]$/.test(quoteContent);
              
              if (endsWithPunctuation) {
                // 检查闭引号后面是什么
                const afterQuoteIndex = quoteEndIndex + 1;
                if (afterQuoteIndex < line.length) {
                  const remainingText = line.substring(afterQuoteIndex);
                  const trimmedAfter = remainingText.trim();
                  // 如果后面不是空白，且不是引号、不是【】，而是普通文本，记录分割位置
                  if (trimmedAfter && 
                      trimmedAfter[0] !== '"' && 
                      trimmedAfter[0] !== '"' && 
                      trimmedAfter[0] !== '' &&
                      trimmedAfter[0] !== '' &&
                      trimmedAfter[0] !== '【') {
                    // 找到第一个非空白字符的位置
                    let firstNonWhitespace = afterQuoteIndex;
                    while (firstNonWhitespace < line.length && /\s/.test(line[firstNonWhitespace])) {
                      firstNonWhitespace++;
                    }
                    splits.push(firstNonWhitespace);
                  }
                }
              }
              
              i = quoteEndIndex + 1;
              continue;
            }
          }
          // 检查是否是英文开引号 " 或 '
          else if (char === '"' || char === "'") {
            // 寻找匹配的闭引号
            let quoteEndIndex = -1;
            let j = i + 1;
            
            while (j < line.length) {
              if (line[j] === char || line[j] === '"' || line[j] === "'") {
                quoteEndIndex = j;
                break;
              }
              j++;
            }
            
            if (quoteEndIndex !== -1) {
              // 找到匹配的闭引号
              const quoteContent = line.substring(i + 1, quoteEndIndex);
              const endsWithPunctuation = /[。！？]$/.test(quoteContent);
              
              if (endsWithPunctuation) {
                // 检查闭引号后面是什么
                const afterQuoteIndex = quoteEndIndex + 1;
                if (afterQuoteIndex < line.length) {
                  const remainingText = line.substring(afterQuoteIndex);
                  const trimmedAfter = remainingText.trim();
                  // 如果后面不是空白，且不是引号、不是【】，而是普通文本，记录分割位置
                  if (trimmedAfter && 
                      trimmedAfter[0] !== '"' && 
                      trimmedAfter[0] !== '"' && 
                      trimmedAfter[0] !== '' &&
                      trimmedAfter[0] !== '' &&
                      trimmedAfter[0] !== '【') {
                    // 找到第一个非空白字符的位置
                    let firstNonWhitespace = afterQuoteIndex;
                    while (firstNonWhitespace < line.length && /\s/.test(line[firstNonWhitespace])) {
                      firstNonWhitespace++;
                    }
                    splits.push(firstNonWhitespace);
                  }
                }
              }
              
              i = quoteEndIndex + 1;
              continue;
            }
          }
          
          i++;
        }
        
        // 如果有分割点，进行分割
        if (splits.length > 1) {
          for (let idx = 0; idx < splits.length; idx++) {
            const start = splits[idx];
            const end = idx < splits.length - 1 ? splits[idx + 1] : line.length;
            const segment = line.substring(start, end).trim();
            if (segment) {
              postProcessedLines.push(segment);
            }
          }
        } else {
          postProcessedLines.push(line);
        }
      }
      
      resultLines.push(...postProcessedLines);
    }
    
    // 最后检查：如果一行中包含连续的【】（2个或以上），应该分割
    const finalResultLines: string[] = [];
    for (const line of resultLines) {
      // 检查是否包含多个连续的【】
      const bracketPattern = /【[^】]*】/g;
      const brackets: Array<{ start: number; end: number }> = [];
      let match;
      
      while ((match = bracketPattern.exec(line)) !== null) {
        brackets.push({ start: match.index, end: match.index + match[0].length });
      }
      
      // 如果有多于1个【】，查找连续的部分
      if (brackets.length > 1) {
        // 查找第一个连续组的开始和结束位置
        let firstConsecutiveStart = -1;
        let firstConsecutiveEnd = -1;
        
        for (let i = 0; i < brackets.length - 1; i++) {
          const current = brackets[i];
          const next = brackets[i + 1];
          // 检查之间是否只有空白（连续）
          const between = line.substring(current.end, next.start);
          if (/^\s*$/.test(between)) {
            // 找到连续的【】
            if (firstConsecutiveStart === -1) {
              firstConsecutiveStart = current.start;
            }
            firstConsecutiveEnd = next.end;
          } else {
            // 如果已经找到连续组，停止
            if (firstConsecutiveStart !== -1) {
              break;
            }
          }
        }
        
        // 如果找到连续的【】，进行分割
        if (firstConsecutiveStart !== -1 && firstConsecutiveEnd !== -1) {
          // 前面的内容
          if (firstConsecutiveStart > 0) {
            const before = line.substring(0, firstConsecutiveStart).trim();
            if (before) {
              finalResultLines.push(before);
            }
          }
          // 将连续的【】区域按每个【】分割成单独的行
          const consecutiveText = line.substring(firstConsecutiveStart, firstConsecutiveEnd);
          // 使用正则匹配每个【】，单独提取
          const bracketPattern = /【[^】]*】/g;
          let bracketMatch;
          while ((bracketMatch = bracketPattern.exec(consecutiveText)) !== null) {
            const bracketText = bracketMatch[0].trim();
            if (bracketText) {
              finalResultLines.push(bracketText);
            }
          }
          // 后面的内容
          if (firstConsecutiveEnd < line.length) {
            const after = line.substring(firstConsecutiveEnd).trim();
            if (after) {
              finalResultLines.push(after);
            }
          }
        } else {
          // 没有连续的【】，直接添加
          finalResultLines.push(line);
        }
      } else {
        // 只有0或1个【】，直接添加
        finalResultLines.push(line);
      }
    }
    
    // 保留原始换行结构，不合并省略号（如果原文中省略号是单独一行，应该保留）
    return finalResultLines.join("\n");
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

