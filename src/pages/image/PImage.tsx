import useRefreshView from "@/common/hooks/useRefreshView";
import { NRsp } from "@/common/namespace/NRsp";
import { UDownload } from "@/common/utils/UDownload";
import {
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Button, Space, Typography, Upload, Input, message } from "antd";
import { RcCustomRequestOptions } from "antd/lib/upload/interface";
import { produce } from "immer";
import { floor } from "lodash";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import SelfStyle from "./LImage.less";
import NImage from "./NImage";
import SImage from "./SImage";
import { classNames } from "@/common";

export interface IPImageProps {}
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
  const [resizeHandle, setResizeHandle] = useState('');
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [initialImageSize, setInitialImageSize] = useState({ width: 0, height: 0, size: 0 });
  const [croppedImageSize, setCroppedImageSize] = useState({ width: 0, height: 0, size: 0 });
  const [currentImageName, setCurrentImageName] = useState("");
  const uploadConfigMapRef = useRef<Map<File, NImage.IUploadConfig>>(new Map());
  const optionConfigMapRef = useRef<Map<string, NImage.IOptioncConfig>>(
    new Map()
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const selectedImageIdRef = useRef<string>();

  const refreshView = useRefreshView();

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    if (selectedImage && selectedImage.url) {
      setCurrentImageName(getNameWithoutExt(selectedImage.name || selectedImage.originalName || ""));
      let ignore = false;
      const currentImageId = selectedImage.id;
      getImageStats(selectedImage.url).then((imageStats) => {
        if (ignore) {
          return;
        }
        setCroppedImageSize(imageStats);
        if (selectedImageIdRef.current !== currentImageId) {
          selectedImageIdRef.current = currentImageId;
          setInitialImageSize(imageStats);
        }
        const displaySize = getDisplaySize(imageStats.width, imageStats.height);
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
  }, [selectedImage]);
  
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
      <div className={SelfStyle.uploadSection}>
        <Upload
          multiple
          className={SelfStyle.uploadWrapper}
          customRequest={customRequest}
          showUploadList={false}
          accept="image/*"
        >
          <div className={SelfStyle.uploadPlus}>
            <PlusOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
            <div className={SelfStyle.uploadText}>点击上传图片</div>
          </div>
        </Upload>
        
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
      
      {selectedImage && (
        <div className={SelfStyle.editSection}>
          <div className={SelfStyle.formSection}>
            <div className={SelfStyle.formItem}>
              <div className={SelfStyle.cropSection}>
                <div
                  className={SelfStyle.cropContainer}
                  style={{ width: `${imageDisplaySize.width}px`, height: `${imageDisplaySize.height}px` }}
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
                    <div className={`${SelfStyle.cropHandle} ${SelfStyle.topRight}`}></div>
                    <div className={`${SelfStyle.cropHandle} ${SelfStyle.bottomLeft}`}></div>
                    <div className={`${SelfStyle.cropHandle} ${SelfStyle.bottomRight}`}></div>
                  </div>
                </div>
                <div style={{ marginTop: '10px' }}>
                  <Button type="primary" onClick={handleCropConfirm}>确认裁剪</Button>
                </div>
              </div>
            </div>
            
            <div className={SelfStyle.imageInfo}>
              <Typography.Text strong>初始大小:</Typography.Text>
              <Typography.Text>{formatSize(initialImageSize.size)}</Typography.Text>
              {initialImageSize.size !== croppedImageSize.size && (
                <>
                  <Typography.Text style={{ marginLeft: "12px" }} strong>裁剪后大小:</Typography.Text>
                  <Typography.Text>{formatSize(croppedImageSize.size)}</Typography.Text>
                </>
              )}
            </div>

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
      )}
    </div>
  );

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
          className={SelfStyle.actions}
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
      const nextRsp = await withImageContent(rsp);
      setImageRsp(nextRsp);
      setSelectedImage((prev) => {
        if (!nextRsp.list?.length) return undefined;
        if (!prev) return nextRsp.list[0];
        return nextRsp.list.find((item) => item.id === prev.id) || nextRsp.list[0];
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
    e.preventDefault(); // 防止默认行为
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // 检查是否点击在裁剪框的手柄上
      const handleSize = 15; // 增大手柄大小，更容易点击
      const handles = [
        { name: 'topLeft', x: cropArea.x, y: cropArea.y },
        { name: 'topRight', x: cropArea.x + cropArea.width, y: cropArea.y },
        { name: 'bottomLeft', x: cropArea.x, y: cropArea.y + cropArea.height },
        { name: 'bottomRight', x: cropArea.x + cropArea.width, y: cropArea.y + cropArea.height }
      ];
      
      const clickedHandle = handles.find(handle => 
        x >= handle.x - handleSize && x <= handle.x + handleSize &&
        y >= handle.y - handleSize && y <= handle.y + handleSize
      );
      
      if (clickedHandle) {
        // 进入调整大小模式
        setResizing(true);
        setResizeHandle(clickedHandle.name);
        setDragStart({ x, y });
      } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
                 y >= cropArea.y && y <= cropArea.y + cropArea.height) {
        // 进入拖动模式
        setIsDragging(true);
        setDragStart({ x, y });
      }
    }
  }

  function handleCropMove(e: React.MouseEvent) {
    e.preventDefault(); // 防止默认行为
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    if (resizing) {
      // 调整裁剪框大小
      setCropArea(prev => {
        let newCropArea = { ...prev };
        
        switch (resizeHandle) {
          case 'topLeft':
            newCropArea.x = Math.max(0, prev.x + dx);
            newCropArea.y = Math.max(0, prev.y + dy);
            newCropArea.width = Math.max(50, prev.width - dx);
            newCropArea.height = Math.max(50, prev.height - dy);
            break;
          case 'topRight':
            newCropArea.y = Math.max(0, prev.y + dy);
            newCropArea.width = Math.max(50, prev.width + dx);
            newCropArea.height = Math.max(50, prev.height - dy);
            break;
          case 'bottomLeft':
            newCropArea.x = Math.max(0, prev.x + dx);
            newCropArea.width = Math.max(50, prev.width - dx);
            newCropArea.height = Math.max(50, prev.height + dy);
            break;
          case 'bottomRight':
            newCropArea.width = Math.max(50, prev.width + dx);
            newCropArea.height = Math.max(50, prev.height + dy);
            break;
        }
        
        return newCropArea;
      });
      setDragStart({ x, y });
    } else if (isDragging) {
      // 拖动裁剪框
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(prev.x + dx, canvas.width - prev.width)),
        y: Math.max(0, Math.min(prev.y + dy, canvas.height - prev.height))
      }));
      setDragStart({ x, y });
    }
  }

  function handleCropEnd(e: React.MouseEvent) {
    if (e) {
      e.preventDefault(); // 防止默认行为
    }
    setIsDragging(false);
    setResizing(false);
    setResizeHandle('');
  }

  function handleCropConfirm() {
    const canvas = canvasRef.current;
    if (canvas && selectedImage) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 创建一个新的画布用于裁剪
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropArea.width;
        cropCanvas.height = cropArea.height;
        const cropCtx = cropCanvas.getContext('2d');
        if (cropCtx) {
          // 裁剪图片
          cropCtx.drawImage(
            canvas,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
          );
          // 将裁剪后的图片转换为 base64
          const croppedImageUrl = cropCanvas.toDataURL('image/png');
          // 更新图片状态
          setSelectedImage(prev => prev ? {
            ...prev,
            url: croppedImageUrl
          } : prev);
        }
      }
    }
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

  function getDisplaySize(width: number, height: number) {
    const maxWidth = 600;
    if (width <= maxWidth) {
      return { width, height };
    }
    const ratio = maxWidth / width;
    return {
      width: maxWidth,
      height: height * ratio,
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
};

export default PImage;
