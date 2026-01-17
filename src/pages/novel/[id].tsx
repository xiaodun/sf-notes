import React, { useEffect, useState } from "react";
import { useParams, ConnectRC } from "umi";
import { message, Spin, Button, Select } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import SelfStyle from "./LNovel.less";
import NNovel from "./NNovel";
import SNovel from "./SNovel";
import NRouter from "@/../config/router/NRouter";
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

  const loadChapterList = async () => {
    if (!novel?.path) return;
    try {
      const result = await request<NRsp<{ chapter: number; exists: boolean }[]>>({
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
  const formatContent = (text: string): string => {
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
        // 检查是否是【】占位符开始（【】要单独成行）
        if (processedLine.substring(j).startsWith('__BRACKET_')) {
          // 找到占位符的结束位置
          const endIndex = processedLine.indexOf('__', j + 11);
          if (endIndex !== -1) {
            const placeholder = processedLine.substring(j, endIndex + 2);
            // 如果当前句子不为空，先保存
            if (currentSentence.trim()) {
              sentenceLines.push(currentSentence.trim());
              currentSentence = "";
            }
            // 【】占位符单独一行
            sentenceLines.push(placeholder);
            j = endIndex + 2;
            continue;
          }
        }
        // 检查是否是引号占位符开始（引号和前后内容一起）
        else if (processedLine.substring(j).startsWith('__QUOTE_')) {
          // 找到占位符的结束位置
          const endIndex = processedLine.indexOf('__', j + 9);
          if (endIndex !== -1) {
            const placeholder = processedLine.substring(j, endIndex + 2);
            // 引号占位符和前后内容一起，作为句子的一部分（不单独成行）
            currentSentence += placeholder;
            j = endIndex + 2;
            continue;
          }
        }
        
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
      const finalSentenceLines = sentenceLines.map(sentence => {
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
      
      resultLines.push(...finalSentenceLines);
    }
    
    // 保留原始换行结构，不合并省略号（如果原文中省略号是单独一行，应该保留）
    return resultLines.join("\n");
  };

  const loadChapterContent = async (chapter: number) => {
    if (!novel?.path) return;
    setContentLoading(true);
    try {
      const result = await request<NRsp<string>>({
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
      } else {
        setContent("章节不存在或读取失败");
      }
    } catch (error) {
      console.error("加载章节内容失败:", error);
      setContent("加载失败");
    } finally {
      setContentLoading(false);
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

  const handleNextChapter = () => {
    const maxChapter = chapterList.length > 0 ? Math.max(...chapterList.map(c => c.chapter)) : 0;
    if (currentChapter < maxChapter) {
      setCurrentChapter(currentChapter + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleChapterChange = (chapter: number) => {
    setCurrentChapter(chapter);
    window.scrollTo(0, 0);
  };

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
      <div className={SelfStyle.header}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => {
            window.location.href = NRouter.novelPath;
          }}
        >
          返回
        </Button>
        <div className={SelfStyle.title}>{novel.name}</div>
        <div className={SelfStyle.chapterSelector}>
          <Select
            value={currentChapter}
            onChange={handleChapterChange}
            style={{ width: 120 }}
            showSearch
            filterOption={(input, option) => {
              const searchText = input.toLowerCase();
              const optionText = option?.children?.toString() || '';
              const optionValue = option?.value;
              
              // 如果输入的是纯数字，直接匹配章节号
              if (/^\d+$/.test(searchText)) {
                const chapterNum = parseInt(searchText, 10);
                return optionValue === chapterNum;
              }
              
              // 否则匹配显示的文本（"第X章"）
              return optionText.toLowerCase().includes(searchText);
            }}
          >
            {Array.from({ length: maxChapter }, (_, i) => i + 1).map((ch) => (
              <Select.Option key={ch} value={ch}>
                第{ch}章
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className={SelfStyle.contentWrapper}>
        {contentLoading ? (
          <div className={SelfStyle.loadingWrapper}>
            <Spin size="large" />
          </div>
        ) : (
          <div className={SelfStyle.content}>
            {content ? (
              content.split('\n').map((line, index) => (
                line.trim() ? (
                  <p key={index} className={SelfStyle.contentLine}>{line}</p>
                ) : (
                  <br key={index} />
                )
              ))
            ) : (
              <p>加载中...</p>
            )}
          </div>
        )}
      </div>

      <div className={SelfStyle.footer}>
        <Button
          disabled={currentChapter <= 1}
          onClick={handlePrevChapter}
        >
          上一章
        </Button>
        <span className={SelfStyle.chapterInfo}>
          {currentChapter} / {maxChapter}
        </span>
        <Button
          disabled={currentChapter >= maxChapter}
          onClick={handleNextChapter}
        >
          下一章
        </Button>
      </div>
    </div>
  );
};

export default NovelDetail;

