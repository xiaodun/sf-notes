import useRefreshView from "@/common/hooks/useRefreshView";
import { NRsp } from "@/common/namespace/NRsp";
import { UDownload } from "@/common/utils/UDownload";
import {
  DeleteOutlined,
  SaveOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Button, Space, Typography, Upload, Input, message } from "antd";
import { history } from "umi";
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
  const [newName, setNewName] = useState("");
  const [compressionSize, setCompressionSize] = useState(100); // 默认压缩到100KB
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState('');
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, size: 0 });
  const uploadConfigMapRef = useRef<Map<File, NImage.IUploadConfig>>(new Map());
  const optionConfigMapRef = useRef<Map<string, NImage.IOptioncConfig>>(
    new Map()
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const refreshView = useRefreshView();

  useEffect(() => {
    getList();
  }, []);

  useEffect(() => {
    if (selectedImage && selectedImage.url) {
      setNewName(selectedImage.originalName || "");
      // 获取图片尺寸和大小
      const img = new Image();
      img.onload = () => {
        // 估算图片大小（base64 编码的大小）
        const base64Length = selectedImage.url.split(',')[1].length;
        const sizeInBytes = Math.ceil(base64Length * 3 / 4);
        setImageSize({
          width: img.width,
          height: img.height,
          size: sizeInBytes
        });
        
        // 计算图片显示尺寸（保持比例，最大宽度 600px）
        const maxWidth = 600;
        let displayWidth = img.width;
        let displayHeight = img.height;
        if (img.width > maxWidth) {
          const ratio = maxWidth / img.width;
          displayWidth = maxWidth;
          displayHeight = img.height * ratio;
        }
        setImageDisplaySize({ width: displayWidth, height: displayHeight });
        
        // 设置默认裁剪区域为整个图片
        setCropArea({
          x: 0,
          y: 0,
          width: displayWidth,
          height: displayHeight
        });
      };
      img.src = selectedImage.url;
    }
  }, [selectedImage]);

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
          <div className={SelfStyle.editHeader}>
            <Typography.Title level={4}>编辑图片: {selectedImage.originalName}</Typography.Title>
          </div>
          
          <div className={SelfStyle.imageInfo}>
            <Typography.Text strong>图片大小:</Typography.Text>
            <Typography.Text>{imageSize.size < 1024 ? `${imageSize.size} B` : imageSize.size < 1024 * 1024 ? `${(imageSize.size / 1024).toFixed(2)} KB` : `${(imageSize.size / (1024 * 1024)).toFixed(2)} MB`}</Typography.Text>
          </div>

          <div className={SelfStyle.formSection}>
            <div className={SelfStyle.formItem}>
              <Typography.Text strong>图片名称:</Typography.Text>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="请输入新的图片名称"
              />
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
              <Typography.Text strong>裁剪图片:</Typography.Text>
              <Button
                type="default"
                onClick={handleCrop}
                style={{ marginBottom: '10px' }}
              >
                {isCropping ? '取消裁剪' : '开始裁剪'}
              </Button>
              {isCropping ? (
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
                    />
                    {selectedImage.url && (
                      <img
                        ref={imageRef}
                        src={selectedImage.url}
                        alt={selectedImage.originalName}
                        className={SelfStyle.hiddenImage}
                        onLoad={() => {
                          if (isCropping) {
                            drawCropCanvas();
                          }
                        }}
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
                    <Button style={{ marginLeft: '10px' }} onClick={() => setIsCropping(false)}>取消</Button>
                  </div>
                </div>
              ) : (
                <div className={SelfStyle.imagePreview} style={{ maxWidth: '600px' }}>
                  <img src={selectedImage.url} alt={selectedImage.originalName} style={{ width: '100%', height: 'auto' }} />
                </div>
              )}
            </div>
          </div>

          <div className={SelfStyle.actions}>
            <Space size={20}>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
              >
                另存为
              </Button>
              <Button
                type="default"
                onClick={handleOverwrite}
              >
                覆盖
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelImage(selectedImage)}
              >
                删除
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
    const isProcessed = params.item?.isProcessed || false;
    const isSelected = selectedImage?.id === params.item?.id;
    return (
      <div 
        key={params.key} 
        className={classNames(SelfStyle.itemWrap, {
          [SelfStyle.processed]: isProcessed,
          [SelfStyle.selected]: isSelected
        })}
        onClick={() => params.item && setSelectedImage(params.item)}
      >
        <div className={SelfStyle.imageWrapper}>
          {params.uploadLoading ? (
            <div className={SelfStyle.placeholder}>
              <div className={SelfStyle.loading}>
                <InboxOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <div className={SelfStyle.loadingText}>上传中...</div>
              </div>
            </div>
          ) : params.item ? (
            <>
              <img src={params.item.url} alt={params.item.originalName} />
              <Button
                danger
                shape="circle"
                size="small"
                icon={<DeleteOutlined />}
                className={SelfStyle.previewDeleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelImage(params.item!);
                }}
              />
            </>
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

  const handleCrop = () => {
    if (isCropping) {
      setIsCropping(false);
      return;
    }
    if (!selectedImage?.url) {
      message.warning('请先选择一张图片');
      return;
    }
    if (!imageDisplaySize.width || !imageDisplaySize.height) {
      message.warning('图片尚未加载完成，请稍后重试');
      return;
    }
    setIsCropping(true);
    requestAnimationFrame(() => {
      if (imageRef.current?.complete) {
        drawCropCanvas();
      }
    });
  };

  const handleCropStart = (e: React.MouseEvent) => {
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
  };

  const handleCropMove = (e: React.MouseEvent) => {
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
  };

  const handleCropEnd = (e: React.MouseEvent) => {
    if (e) {
      e.preventDefault(); // 防止默认行为
    }
    setIsDragging(false);
    setResizing(false);
    setResizeHandle('');
  };

  const handleCropConfirm = () => {
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
          message.success('图片裁剪成功');
          setIsCropping(false);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!selectedImage || !newName) {
      message.error("请输入图片名称");
      return;
    }
    const rsp = await SImage.saveAs(selectedImage, newName, compressionSize);
    if (rsp.success) {
      message.success("图片保存成功");
      getList();
    }
  };

  const handleOverwrite = async () => {
    if (!selectedImage || !newName) {
      message.error("请输入图片名称");
      return;
    }
    const rsp = await SImage.overwrite(selectedImage, newName, compressionSize);
    if (rsp.success) {
      message.success("图片覆盖成功");
      getList();
    }
  };
};

export default PImage;
