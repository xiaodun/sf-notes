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
        setContent(result.data);
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
            optionFilterProp="children"
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
          <div className={SelfStyle.content}>{content || "加载中..."}</div>
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

