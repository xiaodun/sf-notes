import { Button, Input, Typography, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import { history } from "umi";
import React, { FC, useEffect, useState, useRef } from "react";
import SelfStyle from "./LImageDetail.less";
import NImage from "./NImage";
import SImage from "./SImage";
import { useParams } from "react-router-dom";

const { Title, Text } = Typography;

interface IPImageDetailProps {}

const PImageDetail: FC<IPImageDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<NImage>();
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (id) {
      getImageDetail();
    }
  }, [id]);

  const getImageDetail = async () => {
    const rsp = await SImage.getList();
    if (rsp.success) {
      const foundImage = rsp.list.find(item => item.id === id);
      if (foundImage) {
        // 检查是否已经有 base64 编码的 url
        if (!foundImage.url || !foundImage.url.startsWith('data:')) {
          // 调用 getImageContent 获取 base64 编码
          const contentRsp = await SImage.getImageContent(foundImage.id);
          if (contentRsp.success && contentRsp.data?.content) {
            const mimeType = contentRsp.data.mimeType || "application/octet-stream";
            foundImage.url = `data:${mimeType};base64,${contentRsp.data.content}`;
          }
        }
        
        setImage(foundImage);
        setNewName(foundImage.originalName || "");
        // 获取图片尺寸和大小
        if (foundImage.url) {
          const img = new Image();
          img.onload = () => {
            // 估算图片大小（base64 编码的大小）
            const base64Length = foundImage.url.split(',')[1].length;
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
              width: img.width,
              height: img.height
            });
          };
          img.src = foundImage.url;
        }
      }
    }
  };

  const handleCrop = () => {
    setIsCropping(!isCropping);
    if (!isCropping && image && image.url) {
      // 初始化裁剪画布
      setTimeout(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (canvas && img) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            // 设置画布大小为图片显示尺寸
            canvas.width = imageDisplaySize.width;
            canvas.height = imageDisplaySize.height;
            // 绘制图片（保持比例）
            ctx.drawImage(img, 0, 0, imageDisplaySize.width, imageDisplaySize.height);
            // 初始化裁剪区域为整个图片
            setCropArea({
              x: 0,
              y: 0,
              width: imageDisplaySize.width,
              height: imageDisplaySize.height
            });
            // 设置 canvas 元素的实际大小
            canvas.style.width = `${imageDisplaySize.width}px`;
            canvas.style.height = `${imageDisplaySize.height}px`;
          }
        }
      }, 100);
    }
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
    if (canvas && image) {
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
          setImage(prev => prev ? {
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
    if (!image || !newName) {
      message.error("请输入图片名称");
      return;
    }
    const rsp = await SImage.saveAs(image, newName, compressionSize);
    if (rsp.success) {
      message.success("图片保存成功");
      history.push("/image");
    }
  };

  const handleOverwrite = async () => {
    if (!image || !newName) {
      message.error("请输入图片名称");
      return;
    }
    const rsp = await SImage.overwrite(image, newName, compressionSize);
    if (rsp.success) {
      message.success("图片覆盖成功");
      history.push("/image");
    }
  };

  const handleDelete = async () => {
    if (!image) return;
    const rsp = await SImage.delItem(image.id);
    if (rsp.success) {
      message.success("图片删除成功");
      history.push("/image");
    }
  };

  return (
    <div className={SelfStyle.container}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => history.push("/image")}
        className={SelfStyle.backButton}
      >
        返回
      </Button>
      
      <Title level={4} className={SelfStyle.title}>图片编辑</Title>

      {image && (
        <div className={SelfStyle.content}>
          <div className={SelfStyle.imageInfo}>
            <Text strong>图片大小:</Text>
            <Text>{imageSize.size < 1024 ? `${imageSize.size} B` : imageSize.size < 1024 * 1024 ? `${(imageSize.size / 1024).toFixed(2)} KB` : `${(imageSize.size / (1024 * 1024)).toFixed(2)} MB`}</Text>
          </div>

          <div className={SelfStyle.formSection}>
            <div className={SelfStyle.formItem}>
              <Text strong>图片名称:</Text>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="请输入新的图片名称"
              />
            </div>

            <div className={SelfStyle.formItem}>
              <Text strong>压缩大小:</Text>
              <Input
                type="number"
                value={compressionSize}
                onChange={(e) => setCompressionSize(Number(e.target.value))}
                placeholder="请输入压缩后的大小（KB）"
                min={1}
              />
              <Text style={{ marginLeft: '10px' }}>KB</Text>
            </div>

            <div className={SelfStyle.formItem}>
              <Text strong>裁剪图片:</Text>
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
                    {image.url && (
                      <img
                        ref={imageRef}
                        src={image.url}
                        alt={image.originalName}
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
                    <Button style={{ marginLeft: '10px' }} onClick={() => setIsCropping(false)}>取消</Button>
                  </div>
                </div>
              ) : (
                <div className={SelfStyle.imagePreview} style={{ maxWidth: '600px' }}>
                  <img src={image.url} alt={image.originalName} style={{ width: '100%', height: 'auto' }} />
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
                onClick={handleDelete}
              >
                删除
              </Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};

export default PImageDetail;
