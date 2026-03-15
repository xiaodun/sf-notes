import useRefreshView from "@/common/hooks/useRefreshView";
import { NRsp } from "@/common/namespace/NRsp";
import { UDownload } from "@/common/utils/UDownload";
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Button, Space, Typography, Upload, Modal, Input, Slider, message } from "antd";
import { PageFooter } from "@/common/components/page";
import { history } from "umi";
import Browser from "@/utils/browser";
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
  const uploadConfigMapRef = useRef<Map<File, NImage.IUploadConfig>>(new Map());
  const optionConfigMapRef = useRef<Map<string, NImage.IOptioncConfig>>(
    new Map()
  );
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState<NImage>();
  const [newName, setNewName] = useState("");
  const [compressionLevel, setCompressionLevel] = useState(80);
  const [cropData, setCropData] = useState<any>();
  const refreshView = useRefreshView();

  useEffect(() => {
    getList();
  }, []);

  return (
    <div>
      <Upload.Dragger
        multiple
        className={SelfStyle.uploadWrapper}
        customRequest={customRequest}
        showUploadList={false}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽上传图片</p>
      </Upload.Dragger>
      <div className={SelfStyle.btnWrap}>
        <Space direction="horizontal" size={35}>
          <Button type="primary" onClick={onAllDownload}>全部下载</Button>
          <Button danger onClick={onAllDel}>全部删除</Button>
        </Space>
      </div>
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
      <PageFooter>
        {!Browser.isMobile() && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push("/")}
          >
            返回
          </Button>
        )}
      </PageFooter>

      {/* 编辑图片模态框 */}
      <Modal
        title="编辑图片"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={onSaveAs}>另存为</Button>,
          <Button key="overwrite" type="danger" onClick={onOverwrite}>覆盖</Button>,
        ]}
      >
        {currentImage && (
          <div>
            <div className={SelfStyle.editForm}>
              <div className={SelfStyle.formItem}>
                <Typography.Text strong>图片名称:</Typography.Text>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="请输入新的图片名称"
                />
              </div>
              <div className={SelfStyle.formItem}>
                <Typography.Text strong>压缩质量:</Typography.Text>
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
              </div>
              <div className={SelfStyle.imagePreview}>
                <img src={currentImage.url} alt={currentImage.name} />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );

  function onAllDownload() {
    imageRsp.list.forEach((item) => {
      onDownloadImage(item);
    });
  }

  function onAllDel() {
    let argRsp = { list: imageRsp.list };
    imageRsp.list.forEach((item) => {
      onDelImage(item, argRsp);
    });
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
    const optionConfig = optionConfigMapRef.current.get(params.key);
    const isProcessed = params.item?.isProcessed || false;
    return (
      <div 
        key={params.key} 
        className={classNames(SelfStyle.itemWrap, {
          [SelfStyle.processed]: isProcessed
        })}
      >
        <div className={SelfStyle.imageWrapper}>
          {params.item && (
            <img src={params.item.url} alt={params.item.name} />
          )}
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
          <Space size={26}>
            <Button
              type="primary"
              loading={optionConfig?.downloadLoading}
              onClick={() => onDownloadImage(params.item)}
              icon={<DownloadOutlined />}
              shape="circle"
            ></Button>
            <Button
              onClick={() => onEditImage(params.item)}
              icon={<EditOutlined />}
              shape="circle"
            ></Button>
            <Button
              loading={optionConfig?.delLoading}
              onClick={() => onDelImage(params.item)}
              danger
              icon={<DeleteOutlined />}
              shape="circle"
            ></Button>
          </Space>
        </div>
      </div>
    );
  }

  function onDownloadImage(image: NImage) {
    optionConfigMapRef.current.set(image.id, {
      downloadLoading: true,
    });
    refreshView();
    SImage.downloadItem(image.id).then((rsp) => {
      const optionConfig = optionConfigMapRef.current.get(image.id);
      optionConfig.downloadLoading = false;
      refreshView();
      UDownload.download({ name: image.name, blob: rsp });
    });
  }

  function onEditImage(image: NImage) {
    setCurrentImage(image);
    setNewName(image.name);
    setCompressionLevel(80);
    setEditModalVisible(true);
  }

  function onSaveAs() {
    if (!currentImage || !newName) {
      message.error("请输入图片名称");
      return;
    }
    SImage.saveAs(currentImage, newName, compressionLevel).then((rsp) => {
      if (rsp.success) {
        withImageContent(rsp).then((nextRsp) => setImageRsp(nextRsp));
        setEditModalVisible(false);
        message.success("图片保存成功");
      }
    });
  }

  function onOverwrite() {
    if (!currentImage || !newName) {
      message.error("请输入图片名称");
      return;
    }
    SImage.overwrite(currentImage, newName, compressionLevel).then((rsp) => {
      if (rsp.success) {
        withImageContent(rsp).then((nextRsp) => setImageRsp(nextRsp));
        setEditModalVisible(false);
        message.success("图片覆盖成功");
      }
    });
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
      setImageRsp(await withImageContent(rsp));
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
      setImageRsp(await withImageContent(rsp));
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
};

export default PImage;
