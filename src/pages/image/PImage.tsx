import useRefreshView from "@/common/hooks/useRefreshView";
import { NRsp } from "@/common/namespace/NRsp";
import { UDownload } from "@/common/utils/UDownload";
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Space, Typography, Upload, Input, message } from "antd";
import { RcCustomRequestOptions } from "antd/lib/upload/interface";
import { produce } from "immer";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import SelfStyle from "./LImage.less";
import NImage from "./NImage";
import SImage from "./SImage";
import { classNames } from "@/common";

export interface IPImageProps {}
type ResizeHandle =
  | ""
  | "topLeft"
  | "top"
  | "topRight"
  | "right"
  | "bottomRight"
  | "bottom"
  | "bottomLeft"
  | "left";

const MIN_CROP_SIZE = 40;
const EDGE_HIT_SIZE = 14;
const PImage: FC<IPImageProps> = (props) => {
  const [imageRsp, setImageRsp] = useState<NRsp<NImage>>({
    list: [],
  });
  const [selectedImage, setSelectedImage] = useState<NImage>();
  const [compressionSize, setCompressionSize] = useState(100); // 默认压缩到100KB
  const [isCropping, setIsCropping] = useState(true);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>("");
  const [cropCursor, setCropCursor] = useState<React.CSSProperties["cursor"]>("default");
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [cropMaxWidth, setCropMaxWidth] = useState(900);
  const [initialImageSize, setInitialImageSize] = useState({ width: 0, height: 0, size: 0 });
  const [croppedImageSize, setCroppedImageSize] = useState({ width: 0, height: 0, size: 0 });
  const [showCropStats, setShowCropStats] = useState(false);
  const [currentImageName, setCurrentImageName] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const uploadConfigMapRef = useRef<Map<File, NImage.IUploadConfig>>(new Map());
  const optionConfigMapRef = useRef<Map<string, NImage.IOptioncConfig>>(
    new Map()
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const selectedImageIdRef = useRef<string>();
  const originalImageIdRef = useRef<string>();

  const refreshView = useRefreshView();

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    const updateCropMaxWidth = () => {
      const rightWidth = rightSectionRef.current?.clientWidth || window.innerWidth;
      const computedMaxWidth = Math.max(480, Math.floor(rightWidth - 140));
      setCropMaxWidth(computedMaxWidth);
    };
    updateCropMaxWidth();
    window.addEventListener("resize", updateCropMaxWidth);
    return () => {
      window.removeEventListener("resize", updateCropMaxWidth);
    };
  }, []);

  useEffect(() => {
    if (selectedImage && selectedImage.url) {
      setCurrentImageName(getNameWithoutExt(selectedImage.name || selectedImage.originalName || ""));
      let ignore = false;
      const currentImageId = selectedImage.id;
      if (originalImageIdRef.current !== currentImageId) {
        originalImageIdRef.current = currentImageId;
        setOriginalImageUrl(selectedImage.url);
      }
      getImageStats(selectedImage.url).then((imageStats) => {
        if (ignore) {
          return;
        }
        setCroppedImageSize(imageStats);
        if (selectedImageIdRef.current !== currentImageId) {
          selectedImageIdRef.current = currentImageId;
          setInitialImageSize(imageStats);
        }
        const displaySize = getDisplaySize(imageStats.width, imageStats.height, cropMaxWidth);
        setImageDisplaySize(displaySize);
        setCropArea({
          x: 0,
          y: 0,
          width: displaySize.width,
          height: displaySize.height,
        });
      });
      return () => {
        ignore = true;
      };
    }
  }, [selectedImage, cropMaxWidth]);

  useEffect(() => {
    setShowCropStats(false);
  }, [selectedImage?.id]);
  
  const drawCropCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageDisplaySize.width || !imageDisplaySize.height) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = imageDisplaySize.width;
    canvas.height = imageDisplaySize.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, imageDisplaySize.width, imageDisplaySize.height);
    setCropArea({
      x: 0,
      y: 0,
      width: imageDisplaySize.width,
      height: imageDisplaySize.height
    });
    canvas.style.width = `${imageDisplaySize.width}px`;
    canvas.style.height = `${imageDisplaySize.height}px`;
  };

  useEffect(() => {
    if (selectedImage && selectedImage.url && imageDisplaySize.width > 0 && imageDisplaySize.height > 0) {
      // 初始化裁剪画布
      requestAnimationFrame(() => {
        if (imageRef.current?.complete) {
          drawCropCanvas();
        }
      });
    }
  }, [selectedImage, imageDisplaySize]);

  useEffect(() => {
    if (!isCropping) return;
    if (!imageRef.current?.complete) return;
    drawCropCanvas();
  }, [isCropping, imageDisplaySize.width, imageDisplaySize.height, selectedImage?.url]);

  return (
    <div className={SelfStyle.container}>
      <div className={SelfStyle.leftSection}>
        {renderUploadTrigger()}
        <div className={SelfStyle.imageListScroll}>
          <div className={SelfStyle.imageListWrap}>
            {renderUploadImageList()}
            {imageRsp.list.map((item) =>
              renderImageList({
                key: item.id,
                name: item.name,
                item,
                uploadLoading: false,
              })
            )}
          </div>
        </div>
      </div>

      <div className={SelfStyle.rightSection} ref={rightSectionRef}>
        {selectedImage ? (
          <div className={SelfStyle.editSection}>
            <div className={SelfStyle.formSection}>
              <div className={SelfStyle.formItem}>
                <div className={SelfStyle.cropSection}>
                  <div
                    className={SelfStyle.cropContainer}
                    style={{
                      width: `${imageDisplaySize.width}px`,
                      height: `${imageDisplaySize.height}px`,
                      cursor: cropCursor,
                    }}
                    onMouseDown={handleCropStart}
                    onMouseMove={handleCropMove}
                    onMouseUp={(e) => handleCropEnd(e)}
                    onMouseLeave={(e) => handleCropEnd(e)}
                  >
                    <canvas
                      ref={canvasRef}
                      className={SelfStyle.canvas}
                      width={imageDisplaySize.width}
                      height={imageDisplaySize.height}
                    />
                    {selectedImage.url && (
                      <img
                        ref={imageRef}
                        src={selectedImage.url}
                        alt={selectedImage.originalName}
                        className={SelfStyle.hiddenImage}
                      />
                    )}
                    <div
                      className={SelfStyle.cropOverlay}
                      style={{
                        left: `${cropArea.x}px`,
                        top: `${cropArea.y}px`,
                        width: `${cropArea.width}px`,
                        height: `${cropArea.height}px`
                      }}
                    >
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.topLeft}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.top}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.topRight}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.right}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.bottomRight}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.bottom}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.bottomLeft}`}></div>
                      <div className={`${SelfStyle.cropHandle} ${SelfStyle.left}`}></div>
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <Button type="primary" onClick={handleCropConfirm}>确认裁剪</Button>
                  </div>
                </div>
              </div>

              {initialImageSize.width > 0 && (
                <div className={SelfStyle.cropStatsBar}>
                  <div className={SelfStyle.cropStatsLayout}>
                    <div className={SelfStyle.cropStatsBlock}>
                      <span className={SelfStyle.cropStatsValue}>
                        {initialImageSize.width} × {initialImageSize.height}
                      </span>
                      <span className={SelfStyle.cropStatsValue}>
                        {formatSize(initialImageSize.size)}
                      </span>
                    </div>
                    {showCropStats && <span className={SelfStyle.cropStatsDivider}>→</span>}
                    {showCropStats && (
                      <div className={SelfStyle.cropStatsBlock}>
                        <span className={SelfStyle.cropStatsValue}>
                          {croppedImageSize.width} × {croppedImageSize.height}
                        </span>
                        <span className={SelfStyle.cropStatsValue}>
                          {formatSize(croppedImageSize.size)}
                        </span>
                      </div>
                    )}
                  </div>
                  {showCropStats && (
                    <Button size="small" onClick={handleResetCrop}>重置</Button>
                  )}
                </div>
              )}

              <div className={SelfStyle.formItem}>
                <Typography.Text strong>压缩大小:</Typography.Text>
                <Input
                  type="number"
                  value={compressionSize}
                  onChange={(e) => setCompressionSize(Number(e.target.value))}
                  placeholder="请输入压缩后的大小（KB）"
                  min={1}
                />
                <Typography.Text style={{ marginLeft: '10px' }}>KB</Typography.Text>
              </div>
              <div className={SelfStyle.formItem}>
                <Typography.Text strong>图片名称:</Typography.Text>
                <Input
                  value={currentImageName}
                  onChange={(e) => onChangeSelectedImageName(e.target.value)}
                  placeholder="请输入图片名称"
                />
              </div>
            </div>

            <div className={SelfStyle.actions}>
              <Space size={20}>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                >
                  下载
                </Button>
                <Button type="default" onClick={handleOverwrite}>
                  覆盖
                </Button>
              </Space>
            </div>
          </div>
        ) : (
          <div className={SelfStyle.emptyState}>请选择左侧图片进行编辑</div>
        )}
      </div>
    </div>
  );

  function renderUploadTrigger() {
    return (
      <Upload
        multiple
        className={SelfStyle.uploadWrapper}
        customRequest={customRequest}
        showUploadList={false}
        accept="image/*"
      >
        <div className={SelfStyle.uploadPlus}>
          <PlusOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
          <div className={SelfStyle.uploadText}>点击上传图片</div>
        </div>
      </Upload>
    );
  }

  function renderUploadImageList() {
    const list: ReactNode[] = [];
    uploadConfigMapRef.current.forEach((imageConfig, file) => {
      if (imageConfig.uploadLoading) {
        list.push(
          renderImageList({
            key: file.name,
            ...imageConfig,
          })
        );
      }
    });
    return list;
  }

  function renderImageList(
    params: {
      key: any;
      item?: NImage;
    } & Partial<NImage.IUploadConfig>
  ) {
    const isSelected = selectedImage?.id === params.item?.id;
    return (
      <div 
        key={params.key} 
        className={classNames(SelfStyle.itemWrap, {
          [SelfStyle.selected]: isSelected
        })}
        onClick={() => params.item && setSelectedImage(params.item)}
      >
        {!params.uploadLoading && params.item && (
          <div className={SelfStyle.previewItemHeader}>
            <Button
              danger
              shape="circle"
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onDelImage(params.item!);
              }}
            />
          </div>
        )}
        <div className={SelfStyle.imageWrapper}>
          {params.uploadLoading ? (
            <div className={SelfStyle.placeholder}>
              <div className={SelfStyle.loading}>
                <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div className={SelfStyle.loadingText}>上传中...</div>
              </div>
            </div>
          ) : params.item ? (
            <img src={params.item.url} alt={params.item.originalName} />
          ) : null}
        </div>
        <Typography.Text className={SelfStyle.name} ellipsis>
          {params.name}
        </Typography.Text>
        <div
          className={SelfStyle.itemActions}
          style={{
            visibility: params.uploadLoading ? "hidden" : "visible",
          }}
        >
          {params.uploadLoading && (
            <div className={SelfStyle.loadingWrap}>
              {floor((params.loaded * 100) / params.total, 2)}%
            </div>
          )}
        </div>
      </div>
    );
  }

  function onDelImage(image: NImage, argRsp = imageRsp) {
    optionConfigMapRef.current.set(image.id, { delLoading: true });

    SImage.delItem(image.id).then((rsp) => {
      if (rsp.success) {
        const optionConfig = optionConfigMapRef.current.get(image.id);
        optionConfig.delLoading = false;

        const newArgRsp = NRsp.delItem(argRsp, (item) => item.id === image.id);
        if (argRsp !== imageRsp) {
          argRsp.list = newArgRsp.list;
        }
        setImageRsp(newArgRsp);
        
        if (selectedImage?.id === image.id) {
          const nextSelected = newArgRsp.list[0];
          setSelectedImage(nextSelected);
        }

        refreshView();
      }
    });
  }

  function onChangeSelectedImageName(name: string) {
    if (!selectedImage) {
      return;
    }
    setCurrentImageName(name);
  }

  function customRequest({ file }: RcCustomRequestOptions) {
    uploadConfigMapRef.current = produce(
      uploadConfigMapRef.current,
      (drafData) => {
        drafData.set(file, {
          uploadLoading: true,
          loaded: 0,
          total: file.size,
          name: file.name,
        });
      }
    );
    refreshView();
    addItem(file);
  }

  async function getList() {
    const rsp = await SImage.getList();
    if (rsp.success) {
      const nextRsp = await withImageContent(rsp);
      setImageRsp(nextRsp);
      setSelectedImage((prev) => {
        if (!nextRsp.list?.length) return undefined;
        if (!prev) return nextRsp.list[0];
        return nextRsp.list.find((item) => item.id === prev.id) || nextRsp.list[0];
      });
    }
  }

  async function addItem(file: File) {
    const rsp = await SImage.addItem(file, (event) => {
      if (event.loaded !== event.total) {
        uploadConfigMapRef.current = produce(
          uploadConfigMapRef.current,
          (drafData) => {
            const imageConfig = drafData.get(file);
            imageConfig.loaded = event.loaded;
            imageConfig.total = event.total;
          }
        );
        refreshView();
      } else {
        uploadConfigMapRef.current = produce(
          uploadConfigMapRef.current,
          (drafData) => {
            const imageConfig = drafData.get(file);
            imageConfig.loaded = event.loaded;
            imageConfig.total = event.total;
            imageConfig.uploadLoading = false;
          }
        );
        setTimeout(() => {
          refreshView();
        }, 400);
      }
    });
    if (rsp.success) {
      const finalRsp = await withImageContent(rsp);
      setImageRsp(finalRsp);
      setSelectedImage((prev) => {
        if (!finalRsp.list?.length) return undefined;
        if (!prev) return finalRsp.list[0];
        return finalRsp.list.find((item) => item.id === prev.id) || finalRsp.list[0];
      });
    }
  }

  async function withImageContent(rsp: NRsp<NImage>) {
    const list = await Promise.all(
      (rsp.list || []).map(async (item) => {
        try {
          const contentRsp = await SImage.getImageContent(item.id);
          if (!contentRsp.success || !contentRsp.data?.content) {
            return item;
          }
          const mimeType = contentRsp.data.mimeType || "application/octet-stream";
          return {
            ...item,
            url: `data:${mimeType};base64,${contentRsp.data.content}`,
          };
        } catch (error) {
          console.error('Error getting image content:', error);
          return item;
        }
      })
    );
    return {
      ...rsp,
      list,
    };
  }

  function handleCropStart(e: React.MouseEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const activeHandle = getResizeHandleByPoint(x, y);
      if (activeHandle) {
        setResizing(true);
        setResizeHandle(activeHandle);
        setDragStart({ x, y });
        setCropCursor(getCursorByHandle(activeHandle));
      } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
                 y >= cropArea.y && y <= cropArea.y + cropArea.height) {
        setIsDragging(true);
        setDragStart({ x, y });
        setCropCursor("move");
      } else {
        setCropCursor("default");
      }
    }
  }

  function handleCropMove(e: React.MouseEvent) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    if (resizing) {
      setCropArea((prev) =>
        getResizedCropArea(prev, dx, dy, resizeHandle, canvas.width, canvas.height)
      );
      setDragStart({ x, y });
      setCropCursor(getCursorByHandle(resizeHandle));
    } else if (isDragging) {
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + dx, canvas.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + dy, canvas.height - prev.height))
      }));
      setDragStart({ x, y });
      setCropCursor("move");
    } else {
      const hoverHandle = getResizeHandleByPoint(x, y);
      if (hoverHandle) {
        setCropCursor(getCursorByHandle(hoverHandle));
      } else if (
        x >= cropArea.x &&
        x <= cropArea.x + cropArea.width &&
        y >= cropArea.y &&
        y <= cropArea.y + cropArea.height
      ) {
        setCropCursor("move");
      } else {
        setCropCursor("default");
      }
    }
  }

  function handleCropEnd(e: React.MouseEvent) {
    if (e) {
      e.preventDefault();
    }
    setIsDragging(false);
    setResizing(false);
    setResizeHandle("");
    setCropCursor("default");
  }

  function handleCropConfirm() {
    const img = imageRef.current;
    if (img && selectedImage) {
      const scaleX = img.naturalWidth / imageDisplaySize.width;
      const scaleY = img.naturalHeight / imageDisplaySize.height;
      const sourceX = clamp(Math.floor(cropArea.x * scaleX), 0, Math.max(0, img.naturalWidth - 1));
      const sourceY = clamp(Math.floor(cropArea.y * scaleY), 0, Math.max(0, img.naturalHeight - 1));
      const sourceRight = clamp(
        Math.ceil((cropArea.x + cropArea.width) * scaleX),
        sourceX + 1,
        img.naturalWidth
      );
      const sourceBottom = clamp(
        Math.ceil((cropArea.y + cropArea.height) * scaleY),
        sourceY + 1,
        img.naturalHeight
      );
      const sourceWidth = clamp(
        sourceRight - sourceX,
        1,
        Math.max(1, img.naturalWidth - sourceX)
      );
      const sourceHeight = clamp(
        sourceBottom - sourceY,
        1,
        Math.max(1, img.naturalHeight - sourceY)
      );
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = sourceWidth;
      cropCanvas.height = sourceHeight;
      const cropCtx = cropCanvas.getContext('2d');
      if (cropCtx) {
        cropCtx.imageSmoothingEnabled = true;
        cropCtx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          sourceWidth,
          sourceHeight
        );
        const mimeTypeMatch = selectedImage.url?.match(/^data:(image\/[^;]+);/);
        const outputMimeType = mimeTypeMatch?.[1] || "image/png";
        const croppedImageUrl = cropCanvas.toDataURL(outputMimeType);
        const base64Content = croppedImageUrl.split(",")[1] || "";
        const nextSize = Math.ceil((base64Content.length * 3) / 4);
        setCroppedImageSize({
          width: sourceWidth,
          height: sourceHeight,
          size: nextSize,
        });
        setShowCropStats(true);
        setSelectedImage(prev => prev ? {
          ...prev,
          url: croppedImageUrl
        } : prev);
      }
    }
  }

  function handleResetCrop() {
    if (!selectedImage || !originalImageUrl) {
      return;
    }
    setSelectedImage({
      ...selectedImage,
      url: originalImageUrl,
    });
    setCroppedImageSize(initialImageSize);
    setShowCropStats(false);
  }

  async function handleDownload() {
    if (!selectedImage?.url) {
      message.error("请选择图片");
      return;
    }
    try {
      const blob = await fetch(selectedImage.url).then((response) => response.blob());
      await UDownload.download(
        { name: getDownloadName(selectedImage), blob },
        { useSuccess: false }
      );
      message.success("图片下载成功");
    } catch (error) {
      message.error("图片下载失败");
    }
  }

  async function handleOverwrite() {
    if (!selectedImage) {
      message.error("请选择图片");
      return;
    }
    const overwriteName = currentImageName || selectedImage.name || "image";
    const rsp = await SImage.overwrite(selectedImage, overwriteName, compressionSize);
    if (rsp.success) {
      selectedImageIdRef.current = "";
      setInitialImageSize(croppedImageSize);
      getList();
    }
  }

  function getDisplaySize(width: number, height: number, maxWidth = 600) {
    const sourceWidth = Math.max(1, Math.round(width));
    const sourceHeight = Math.max(1, Math.round(height));
    if (width <= maxWidth) {
      return { width: sourceWidth, height: sourceHeight };
    }
    const ratio = maxWidth / width;
    return {
      width: Math.max(1, Math.round(maxWidth)),
      height: Math.max(1, Math.round(sourceHeight * ratio)),
    };
  }

  function getDownloadName(image: NImage) {
    return currentImageName || image.name || "image";
  }

  function getNameWithoutExt(name: string) {
    return name.replace(/\.[^/.]+$/, "");
  }

  async function getImageStats(url: string) {
    return new Promise<{ width: number; height: number; size: number }>((resolve) => {
      const img = new Image();
      img.onload = async () => {
        let imageSize = 0;
        if (url.startsWith("data:") && url.includes(",")) {
          const base64Content = url.split(",")[1] || "";
          imageSize = Math.ceil((base64Content.length * 3) / 4);
        } else {
          try {
            const blob = await fetch(url).then((response) => response.blob());
            imageSize = blob.size;
          } catch (error) {
            imageSize = 0;
          }
        }
        resolve({
          width: img.width,
          height: img.height,
          size: imageSize,
        });
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0, size: 0 });
      };
      img.src = url;
    });
  }

  function formatSize(size: number) {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function getCursorByHandle(handle: ResizeHandle) {
    switch (handle) {
      case "topLeft":
      case "bottomRight":
        return "nwse-resize";
      case "topRight":
      case "bottomLeft":
        return "nesw-resize";
      case "top":
      case "bottom":
        return "ns-resize";
      case "left":
      case "right":
        return "ew-resize";
      default:
        return "default";
    }
  }

  function getResizeHandleByPoint(x: number, y: number): ResizeHandle {
    const left = cropArea.x;
    const top = cropArea.y;
    const right = cropArea.x + cropArea.width;
    const bottom = cropArea.y + cropArea.height;
    const nearLeft = Math.abs(x - left) <= EDGE_HIT_SIZE && y >= top - EDGE_HIT_SIZE && y <= bottom + EDGE_HIT_SIZE;
    const nearRight = Math.abs(x - right) <= EDGE_HIT_SIZE && y >= top - EDGE_HIT_SIZE && y <= bottom + EDGE_HIT_SIZE;
    const nearTop = Math.abs(y - top) <= EDGE_HIT_SIZE && x >= left - EDGE_HIT_SIZE && x <= right + EDGE_HIT_SIZE;
    const nearBottom = Math.abs(y - bottom) <= EDGE_HIT_SIZE && x >= left - EDGE_HIT_SIZE && x <= right + EDGE_HIT_SIZE;
    if (nearTop && nearLeft) return "topLeft";
    if (nearTop && nearRight) return "topRight";
    if (nearBottom && nearRight) return "bottomRight";
    if (nearBottom && nearLeft) return "bottomLeft";
    if (nearTop) return "top";
    if (nearRight) return "right";
    if (nearBottom) return "bottom";
    if (nearLeft) return "left";
    return "";
  }

  function getResizedCropArea(
    prev: { x: number; y: number; width: number; height: number },
    dx: number,
    dy: number,
    handle: ResizeHandle,
    canvasWidth: number,
    canvasHeight: number
  ) {
    let left = prev.x;
    let top = prev.y;
    let right = prev.x + prev.width;
    let bottom = prev.y + prev.height;

    const normalizedHandle = handle.toLowerCase();
    if (normalizedHandle.includes("left")) left += dx;
    if (normalizedHandle.includes("right")) right += dx;
    if (normalizedHandle.includes("top")) top += dy;
    if (normalizedHandle.includes("bottom")) bottom += dy;

    left = clamp(left, 0, canvasWidth - MIN_CROP_SIZE);
    top = clamp(top, 0, canvasHeight - MIN_CROP_SIZE);
    right = clamp(right, MIN_CROP_SIZE, canvasWidth);
    bottom = clamp(bottom, MIN_CROP_SIZE, canvasHeight);

    if (right - left < MIN_CROP_SIZE) {
      if (normalizedHandle.includes("left")) {
        left = right - MIN_CROP_SIZE;
      } else {
        right = left + MIN_CROP_SIZE;
      }
    }

    if (bottom - top < MIN_CROP_SIZE) {
      if (normalizedHandle.includes("top")) {
        top = bottom - MIN_CROP_SIZE;
      } else {
        bottom = top + MIN_CROP_SIZE;
      }
    }

    left = clamp(left, 0, canvasWidth - MIN_CROP_SIZE);
    top = clamp(top, 0, canvasHeight - MIN_CROP_SIZE);
    right = clamp(right, left + MIN_CROP_SIZE, canvasWidth);
    bottom = clamp(bottom, top + MIN_CROP_SIZE, canvasHeight);

    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  }
};

export default PImage;
