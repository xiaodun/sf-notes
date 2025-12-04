import React, { useEffect, useRef, useState, useCallback } from "react";
import SelfStyle from "./LJokes.less";
import SJokes from "./SJokes";
import { Button, message, Input } from "antd";
import EditModal, { IEditModal } from "./components/EditModal";
import { PageFooter } from "@/common/components/page";
import { connect } from "dva";
import NModel from "@/common/namespace/NModel";
import { ConnectRC } from "umi";
import { NMDJokes } from "./models/MDJokes";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import Browser from "@/utils/browser";
import NJokes from "./NJokes";

export interface PJokesProps {
  MDJokes: NMDJokes.IState;
}
const PJokes: ConnectRC<PJokesProps> = (props) => {
  const { MDJokes } = props;
  const editModalRef = useRef<IEditModal>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [expandedJokes, setExpandedJokes] = useState<Set<string>>(new Set());
  const [jumpInputValue, setJumpInputValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const dragThreshold = 30; // 滑动阈值，降低到30px让切换更灵敏

  useEffect(() => {
    reqGetList();
    setTimeout(() => {
      document.title = "段子";
    });
  }, []);

  useEffect(() => {
    // 当 currentIndex 变化时，滚动到顶部并收起所有展开的下段内容
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    // 切换段子时，收起所有展开的下段内容
    setExpandedJokes(new Set());
  }, [MDJokes.currentIndex]);

  // 键盘事件监听和鼠标滚轮水平滚动支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 如果正在输入框中输入，不处理键盘事件
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      const totalCount = MDJokes.rsp.list.length;
      if (totalCount === 0) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        // 循环逻辑：如果是第一个，则跳到最后一个
        const newIndex =
          MDJokes.currentIndex > 0 ? MDJokes.currentIndex - 1 : totalCount - 1;
        NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        // 循环逻辑：如果是最后一个，则跳到第一个
        const newIndex =
          MDJokes.currentIndex < totalCount - 1 ? MDJokes.currentIndex + 1 : 0;
        NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
      }
    };

    const handleWheel = (event: WheelEvent) => {
      const totalCount = MDJokes.rsp.list.length;
      if (totalCount === 0) return;

      // 如果正在输入框中输入，不处理滚轮事件
      const target = event.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      // 检测是否按住了 Shift 键（Shift + 滚轮 = 水平滚动）
      const isShiftPressed = event.shiftKey;

      // 如果正在滚动内容区域，需要判断是否有垂直滚动
      if (containerRef.current && containerRef.current.contains(target)) {
        // 如果内容区域有垂直滚动，且没有按住 Shift，优先处理垂直滚动
        if (
          !isShiftPressed &&
          containerRef.current.scrollHeight > containerRef.current.clientHeight
        ) {
          return;
        }
      }

      // 检测水平滚动（deltaX）或 Shift + 垂直滚动（deltaY）
      const horizontalDelta = isShiftPressed ? event.deltaY : event.deltaX;
      const verticalDelta = isShiftPressed ? event.deltaX : event.deltaY;

      // 如果是水平滚动，或者按住 Shift 时的垂直滚动
      if (
        (Math.abs(horizontalDelta) > Math.abs(verticalDelta) &&
          Math.abs(horizontalDelta) > 30) ||
        (isShiftPressed && Math.abs(horizontalDelta) > 30)
      ) {
        event.preventDefault();
        if (horizontalDelta > 0) {
          // 向右滚动（或 Shift + 向下滚动），显示下一个
          const newIndex =
            MDJokes.currentIndex < totalCount - 1
              ? MDJokes.currentIndex + 1
              : 0;
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
        } else {
          // 向左滚动（或 Shift + 向上滚动），显示上一个
          const newIndex =
            MDJokes.currentIndex > 0
              ? MDJokes.currentIndex - 1
              : totalCount - 1;
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [MDJokes.currentIndex, MDJokes.rsp.list.length]);

  // 鼠标按下和滑动切换支持
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 如果点击的是链接、按钮或输入框，不处理
    const target = e.target as HTMLElement;
    if (
      target.tagName === "A" ||
      target.tagName === "BUTTON" ||
      target.tagName === "INPUT" ||
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input")
    ) {
      return;
    }

    // 整个内容区域都支持拖拽（包括空白区域）
    setIsDragging(true);
    setDragStartX(e.clientX);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      const totalCount = MDJokes.rsp.list.length;

      if (totalCount === 0) {
        setIsDragging(false);
        return;
      }

      // 如果滑动距离超过阈值，切换段子
      if (Math.abs(deltaX) > dragThreshold) {
        if (deltaX > 0) {
          // 向右滑动，显示上一个
          const newIndex =
            MDJokes.currentIndex > 0
              ? MDJokes.currentIndex - 1
              : totalCount - 1;
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
        } else {
          // 向左滑动，显示下一个
          const newIndex =
            MDJokes.currentIndex < totalCount - 1
              ? MDJokes.currentIndex + 1
              : 0;
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
        }
        setIsDragging(false);
        setDragStartX(0); // 重置起始位置
      }
    },
    [
      isDragging,
      dragStartX,
      dragThreshold,
      MDJokes.currentIndex,
      MDJokes.rsp.list.length,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStartX(0);
  }, []);

  // 触摸事件处理（移动端支持）
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      // 如果点击的是链接、按钮或输入框，不处理
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input")
      ) {
        return;
      }

      // 记录触摸起始位置
      const touch = e.touches[0];
      setTouchStartX(touch.clientX);
      setIsDragging(true);
      e.preventDefault();
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const totalCount = MDJokes.rsp.list.length;

      if (totalCount === 0) {
        setIsDragging(false);
        return;
      }

      // 如果滑动距离超过阈值，切换段子
      if (Math.abs(deltaX) > dragThreshold) {
        if (deltaX > 0) {
          // 向右滑动，显示上一个
          const newIndex =
            MDJokes.currentIndex > 0
              ? MDJokes.currentIndex - 1
              : totalCount - 1;
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
        } else {
          // 向左滑动，显示下一个
          const newIndex =
            MDJokes.currentIndex < totalCount - 1
              ? MDJokes.currentIndex + 1
              : 0;
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
        }
        setIsDragging(false);
        setTouchStartX(0);
      }
    },
    [
      isDragging,
      touchStartX,
      dragThreshold,
      MDJokes.currentIndex,
      MDJokes.rsp.list.length,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTouchStartX(0);
  }, []);

  // 全局鼠标移动和释放事件监听
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 全局触摸移动和结束事件监听（移动端）
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  async function reqGetList(shouldResetToFirst: boolean = false) {
    const rsp = await SJokes.getList();
    if (rsp.success) {
      // 兼容旧数据：如果有 content 但没有 upperContent，将 content 迁移到 upperContent
      rsp.list.forEach((joke) => {
        if (!joke.upperContent && (joke as any).content) {
          joke.upperContent = (joke as any).content;
        }
        if (!joke.upperContent) {
          joke.upperContent = "";
        }
        if (!joke.lowerContent) {
          joke.lowerContent = "";
        }
      });
      NModel.dispatch(new NMDJokes.ARSetRsp(rsp));
      // 如果是新添加的，切换到第一个；否则确保 currentIndex 有效
      if (shouldResetToFirst && rsp.list.length > 0) {
        NModel.dispatch(new NMDJokes.ARSetCurrentIndex(0));
      } else if (
        rsp.list.length > 0 &&
        MDJokes.currentIndex >= rsp.list.length
      ) {
        NModel.dispatch(new NMDJokes.ARSetCurrentIndex(rsp.list.length - 1));
      }
    }
  }

  const onPrev = useCallback(() => {
    const totalCount = MDJokes.rsp.list.length;
    if (totalCount === 0) return;

    // 循环逻辑：如果是第一个，则跳到最后一个
    const newIndex =
      MDJokes.currentIndex > 0 ? MDJokes.currentIndex - 1 : totalCount - 1;
    NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
  }, [MDJokes.currentIndex, MDJokes.rsp.list.length]);

  const onNext = useCallback(() => {
    const totalCount = MDJokes.rsp.list.length;
    if (totalCount === 0) return;

    // 循环逻辑：如果是最后一个，则跳到第一个
    const newIndex =
      MDJokes.currentIndex < totalCount - 1 ? MDJokes.currentIndex + 1 : 0;
    NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newIndex));
  }, [MDJokes.currentIndex, MDJokes.rsp.list.length]);

  function onAddJoke() {
    editModalRef.current.showModal(null, 0);
  }

  function onEditJoke() {
    const currentJoke = MDJokes.rsp.list[MDJokes.currentIndex];
    if (currentJoke) {
      editModalRef.current.showModal(currentJoke, MDJokes.currentIndex);
    }
  }

  async function onDeleteJoke() {
    const currentJoke = MDJokes.rsp.list[MDJokes.currentIndex];
    if (currentJoke && currentJoke.id) {
      const rsp = await SJokes.delItem(currentJoke.id);
      if (rsp.success) {
        message.success("删除成功");
        const oldIndex = MDJokes.currentIndex;
        const deletedId = currentJoke.id;
        // 从展开列表中移除已删除的段子
        setExpandedJokes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(deletedId);
          return newSet;
        });
        await reqGetList();
        // 删除后调整 currentIndex
        const newListLength = MDJokes.rsp.list.length;
        if (newListLength === 0) {
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(0));
        } else if (oldIndex >= newListLength) {
          NModel.dispatch(new NMDJokes.ARSetCurrentIndex(newListLength - 1));
        }
      }
    }
  }

  function onJumpToIndex(index: number) {
    if (index >= 0 && index < MDJokes.rsp.list.length) {
      NModel.dispatch(new NMDJokes.ARSetCurrentIndex(index));
      setJumpInputValue("");
    }
  }

  function handleJumpInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setJumpInputValue(value);
  }

  function handleJumpInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const num = parseInt(jumpInputValue);
      if (!isNaN(num) && num >= 1 && num <= totalCount) {
        onJumpToIndex(num - 1);
      } else {
        message.warning(`请输入 1-${totalCount} 之间的数字`);
        setJumpInputValue("");
      }
    }
  }

  function onToggleLowerContent(jokeId: string) {
    setExpandedJokes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jokeId)) {
        newSet.delete(jokeId);
      } else {
        newSet.add(jokeId);
      }
      return newSet;
    });
  }

  function parseContent(content: string, base64: Object) {
    if (!content) return null;
    const lines = content.split("\n");
    const result: React.ReactNode[] = [];
    const linkPattern = /(https?:\/\/[^\s]+|base64img:\/\/[^\s]+)/g;

    lines.forEach((line, lineIndex) => {
      if (!line.trim()) {
        result.push(<p key={`line-${lineIndex}`}>&nbsp;</p>);
        return;
      }

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;

      while ((match = linkPattern.exec(line)) !== null) {
        // 添加链接前的文本
        if (match.index > lastIndex) {
          const text = line.substring(lastIndex, match.index);
          if (text) {
            parts.push(text);
          }
        }

        const link = match[0];
        const isImg = link.indexOf(NJokes.imgProtocolKey) === 0;

        if (isImg) {
          // base64图片
          const src = base64[link];
          if (src) {
            parts.push(
              <img
                key={`img-${lineIndex}-${match.index}`}
                src={src}
                alt=""
                className={SelfStyle.contentImg}
              />
            );
          }
        } else {
          // 普通链接
          parts.push(
            <a
              key={`link-${lineIndex}-${match.index}`}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={SelfStyle.contentLink}
            >
              {link}
            </a>
          );
        }

        lastIndex = match.index + link.length;
      }

      // 添加剩余的文本
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      if (parts.length > 0) {
        result.push(<p key={`line-${lineIndex}`}>{parts}</p>);
      } else {
        result.push(<p key={`line-${lineIndex}`}>{line}</p>);
      }
    });

    return result.length > 0 ? result : null;
  }

  const currentJoke = MDJokes.rsp.list[MDJokes.currentIndex];
  const totalCount = MDJokes.rsp.list.length;
  const isMobile = Browser.isMobile();

  return (
    <div
      className={`${SelfStyle.jokesContainer} ${
        isMobile ? SelfStyle.mobile : ""
      }`}
    >
      <div className={SelfStyle.header}>
        <div className={SelfStyle.navButtons}>
          <Button onClick={onPrev} size={isMobile ? "small" : "middle"}>
            <LeftOutlined />
            {isMobile ? "" : "上一个"}
          </Button>
          {totalCount > 0 ? (
            <div className={SelfStyle.counterContainer}>
              <Input
                className={SelfStyle.jumpInput}
                value={jumpInputValue}
                placeholder={`${MDJokes.currentIndex + 1}`}
                onChange={handleJumpInputChange}
                onKeyDown={handleJumpInputKeyDown}
                onBlur={() => setJumpInputValue("")}
                size={isMobile ? "small" : "middle"}
                style={{ width: isMobile ? 50 : 60, textAlign: "center" }}
              />
              <span className={SelfStyle.counter}>/ {totalCount}</span>
            </div>
          ) : (
            <span className={SelfStyle.counter}>暂无段子</span>
          )}
          <Button onClick={onNext} size={isMobile ? "small" : "middle"}>
            {isMobile ? "" : "下一个"}
            <RightOutlined />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`${SelfStyle.contentContainer} ${
          isTransitioning ? SelfStyle.transitioning : ""
        } ${isDragging ? SelfStyle.dragging : ""}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        {MDJokes.rsp.list.length === 0 ? (
          <div className={SelfStyle.emptyState}>
            <p>暂无段子，点击下方按钮添加第一个段子吧！</p>
          </div>
        ) : currentJoke ? (
          (() => {
            const isExpanded =
              currentJoke.id && expandedJokes.has(currentJoke.id);
            // 兼容旧数据：如果有 content 但没有 upperContent，使用 content
            const upperContent =
              currentJoke.upperContent || (currentJoke as any).content || "";
            const lowerContent = currentJoke.lowerContent || "";
            const hasLowerContent = lowerContent.trim();
            const base64 = currentJoke.base64 || {};
            return (
              <div className={SelfStyle.jokeItem}>
                <div className={SelfStyle.jokeContent}>
                  <div className={SelfStyle.upperContent}>
                    {parseContent(upperContent, base64)}
                  </div>
                  {hasLowerContent && (
                    <>
                      {!isExpanded && (
                        <div className={SelfStyle.viewButtonContainer}>
                          <Button
                            type="primary"
                            onClick={() =>
                              onToggleLowerContent(currentJoke.id!)
                            }
                          >
                            查看
                          </Button>
                        </div>
                      )}
                      {isExpanded && (
                        <div className={SelfStyle.lowerContent}>
                          {lowerContent.split("\n").map((line, i) => (
                            <p key={i}>{line || "\u00A0"}</p>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })()
        ) : null}
      </div>

      <PageFooter>
        <Button onClick={onAddJoke} size={isMobile ? "small" : "middle"}>
          添加
        </Button>
        {currentJoke && (
          <>
            <Button onClick={onEditJoke} size={isMobile ? "small" : "middle"}>
              修改
            </Button>
            <Button
              danger
              onClick={onDeleteJoke}
              size={isMobile ? "small" : "middle"}
            >
              删除
            </Button>
          </>
        )}
      </PageFooter>

      <EditModal
        onOk={() => reqGetList(true)}
        ref={editModalRef}
        rsp={MDJokes.rsp}
      ></EditModal>
    </div>
  );
};

export default connect(({ MDJokes }: NModel.IState) => ({
  MDJokes,
}))(PJokes);
