import { Button, Input, Slider, Typography, Space, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined } from "@ant-design/icons";
import { history } from "umi";
import React, { FC, useEffect, useState } from "react";
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
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, size: 0 });
  const [cropData, setCropData] = useState<any>();
  const [isCropping, setIsCropping] = useState(false);

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
        setImage(foundImage);
        setNewName(foundImage.originalName || "");
        // 获取图片尺寸
        if (foundImage.url) {
          const img = new Image();
          img.onload = () => {
            setImageSize({ width: img.width, height: img.height });
          };
          img.src = foundImage.url;
        }
      }
    }
  };

  const handleSave = async () => {
    if (!image || !newName) {
      message.error("请输入图片名称");
      return;
    }
    const rsp = await SImage.saveAs(image, newName, compressionLevel);
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
    const rsp = await SImage.overwrite(image, newName, compressionLevel);
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
      <div className={SelfStyle.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push("/image")}
        >
          返回
        </Button>
        <Title level={4}>图片详情</Title>
      </div>

      {image && (
        <div className={SelfStyle.content}>
          <div className={SelfStyle.imageSection}>
            <div className={SelfStyle.imageWrapper}>
              <img src={image.url} alt={image.originalName} />
            </div>
            <div className={SelfStyle.imageInfo}>
              <Text strong>当前尺寸:</Text>
              <Text>{imageSize.width} x {imageSize.height} 像素</Text>
            </div>
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
              <Text strong>压缩质量:</Text>
              <Slider
                value={compressionLevel}
                onChange={setCompressionLevel}
                min={10}
                max={100}
                marks={{
                  10: '10%',
                  50: '50%',
                  100: '100%',
                }}
              />
              <Text>{compressionLevel}%</Text>
            </div>

            <div className={SelfStyle.formItem}>
              <Text strong>裁剪图片:</Text>
              <div className={SelfStyle.cropSection}>
                {/* 这里可以集成图片裁剪库，例如 react-easy-crop */}
                <div className={SelfStyle.cropPlaceholder}>
                  裁剪功能开发中...
                </div>
              </div>
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