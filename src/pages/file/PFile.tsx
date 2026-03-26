import useRefreshView from "@/common/hooks/useRefreshView";
import { NRsp } from "@/common/namespace/NRsp";
import { UDownload } from "@/common/utils/UDownload";
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Modal, Slider, Space, Typography, Upload } from "antd";
import { PageFooter } from "@/common/components/page";
import { history } from "umi";
import Browser from "@/utils/browser";
import { RcCustomRequestOptions } from "antd/lib/upload/interface";

import { produce } from "immer";

import { floor } from "lodash";
import React, { FC, ReactNode, useEffect, useRef, useState } from "react";
import UWsBridge from "@/common/utils/UWsBridge";
import wsEvent from "@/common/constants/wsEvent";

import SelfStyle from "./LFile.less";
import NFile from "./NFile";
import SFile from "./SFile";
import serviceConfig from "@/../service/app/config.json";
export interface IPFileProps {}
const PFile: FC<IPFileProps> = (props) => {
  const [fileRsp, setFileRsp] = useState<NRsp<NFile>>({
    list: [],
  });
  const uploadConfigMapRef = useRef<Map<File, NFile.IUploadConfig>>(new Map());
  const optionConfigMapRef = useRef<Map<string, NFile.IOptioncConfig>>(
    new Map()
  );
  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    src: "",
    scale: 1,
    naturalWidth: 0,
    naturalHeight: 0,
  });

  const refreshView = useRefreshView();
  useEffect(() => {
    getList();
    const off = UWsBridge.on(wsEvent.key.FILE, () => {
      getList();
    });
    return off;
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
        <p className="ant-upload-text">点击或拖拽上传</p>
      </Upload.Dragger>
      <div className={SelfStyle.btnWrap}>
        <Space direction="horizontal" size={35}>
          <Button type="primary" onClick={onAllDownload}>
            全部下载
          </Button>
          <Button danger onClick={onAllDel}>
            全部删除
          </Button>
        </Space>
      </div>
      <div className={SelfStyle.fileListWrap}>
        {renderUploadFileList()}
        {fileRsp.list.map((item) =>
          renderFileList({
            key: item.id,
            name: item.name,
            item,
            uploadLoading: false,
          })
        )}
      </div>
      <Modal
        open={previewConfig.visible}
        footer={null}
        onCancel={onClosePreview}
        width="100vw"
        style={{ top: 0, maxWidth: "100vw", paddingBottom: 0 }}
        bodyStyle={{
          height: "calc(100vh - 55px)",
          padding: "12px 16px 16px",
          overflow: "hidden",
        }}
        destroyOnClose
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              background: "#1f1f1f",
              borderRadius: 6,
            }}
            onWheel={onPreviewWheel}
          >
            <div
              style={{
                width: previewConfig.naturalWidth
                  ? Math.max(
                      previewConfig.naturalWidth * previewConfig.scale,
                      320
                    )
                  : "100%",
                height: previewConfig.naturalHeight
                  ? Math.max(
                      previewConfig.naturalHeight * previewConfig.scale,
                      220
                    )
                  : "100%",
                minWidth: "100%",
                minHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
                boxSizing: "border-box",
              }}
            >
              <img
                src={previewConfig.src}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  setPreviewConfig((prev) => ({
                    ...prev,
                    naturalWidth,
                    naturalHeight,
                  }));
                }}
                style={{
                  width: previewConfig.naturalWidth
                    ? previewConfig.naturalWidth * previewConfig.scale
                    : "auto",
                  height: previewConfig.naturalHeight
                    ? previewConfig.naturalHeight * previewConfig.scale
                    : "auto",
                  maxWidth: "none",
                  maxHeight: "none",
                  transition: "width 0.08s linear, height 0.08s linear",
                  userSelect: "none",
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, padding: "0 6px" }}>
            <Slider
              min={0.2}
              max={3}
              step={0.1}
              value={previewConfig.scale}
              onChange={onPreviewSliderChange}
            />
          </div>
        </div>
      </Modal>
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
    </div>
  );
  function onAllDownload() {
    fileRsp.list.forEach((item) => {
      onDownloadFile(item);
    });
  }
  function onAllDel() {
    let argRsp = { list: fileRsp.list };
    fileRsp.list.forEach((item) => {
      onDelFile(item, argRsp);
    });
  }
  function renderUploadFileList() {
    const list: ReactNode[] = [];
    uploadConfigMapRef.current.forEach((fileConfig, file) => {
      if (fileConfig.uploadLoading) {
        list.push(
          renderFileList({
            key: file.name,
            ...fileConfig,
          })
        );
      }
    });
    return list;
  }
  function renderFileList(
    params: {
      key: any;
      item?: NFile;
    } & Partial<NFile.IUploadConfig>
  ) {
    const optionConfig = optionConfigMapRef.current.get(params.key);
    const isImage = params.name && /\.(png|jpe?g|gif|svg|webp|bmp)$/i.test(params.name);

    return (
      <div key={params.key} className={SelfStyle.itemWrap}>
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
          <Space size={16} style={{ display: 'flex', alignItems: 'center' }}>
            {isImage && params.item ? (
              <Button
                icon={<EyeOutlined />}
                shape="circle"
                onClick={() => onOpenPreview(params.item)}
              ></Button>
            ) : (
              <div style={{ width: 32, height: 32 }}></div>
            )}
            <Button
              type="primary"
              loading={optionConfig?.downloadLoading}
              onClick={() => onDownloadFile(params.item)}
              icon={<DownloadOutlined />}
              shape="circle"
            ></Button>
            <Button
              loading={optionConfig?.delLoading}
              onClick={() => onDelFile(params.item)}
              danger
              icon={<DeleteOutlined />}
              shape="circle"
            ></Button>
          </Space>
        </div>
      </div>
    );
  }
  function onDownloadFile(file: NFile) {
    optionConfigMapRef.current.set(file.id, {
      downloadLoading: true,
    });
    refreshView();
    SFile.downloadItem(file.id).then((rsp) => {
      const optionConfig = optionConfigMapRef.current.get(file.id);
      optionConfig.downloadLoading = false;
      refreshView();
      UDownload.download({ name: file.name, blob: rsp });
    });
  }
  function onDelFile(file: NFile, argRsp = fileRsp) {
    optionConfigMapRef.current.set(file.id, { delLoading: true });

    SFile.delItem(file.id).then((rsp) => {
      if (rsp.success) {
        const optionConfig = optionConfigMapRef.current.get(file.id);
        optionConfig.delLoading = false;

        const newArgRsp = NRsp.delItem(argRsp, (item) => item.id === file.id);
        if (argRsp !== fileRsp) {
          argRsp.list = newArgRsp.list;
        }
        setFileRsp(newArgRsp);

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
  function onOpenPreview(file: NFile) {
    setPreviewConfig({
      visible: true,
      src: `/${serviceConfig.prefix}/upload/downloadFile?id=${file.id}`,
      scale: 1,
      naturalWidth: 0,
      naturalHeight: 0,
    });
  }
  function onClosePreview() {
    setPreviewConfig((prev) => ({
      ...prev,
      visible: false,
    }));
  }
  function onPreviewScaleChange(scale: number) {
    const nextScale = Math.min(3, Math.max(0.2, Number(scale.toFixed(2))));
    setPreviewConfig((prev) => ({
      ...prev,
      scale: nextScale,
    }));
  }
  function onPreviewSliderChange(value: number | [number, number]) {
    if (Array.isArray(value)) {
      return;
    }
    onPreviewScaleChange(value);
  }
  function onPreviewWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    onPreviewScaleChange(previewConfig.scale + delta);
  }
  async function getList() {
    const rsp = await SFile.getList();
    if (rsp.success) {
      setFileRsp(rsp);
    }
  }
  async function addItem(file: File) {
    const rsp = await SFile.addItem(file, (event) => {
      if (event.loaded !== event.total) {
        uploadConfigMapRef.current = produce(
          uploadConfigMapRef.current,
          (drafData) => {
            const fileConfig = drafData.get(file);
            fileConfig.loaded = event.loaded;
            fileConfig.total = event.total;
          }
        );
        refreshView();
      } else {
        uploadConfigMapRef.current = produce(
          uploadConfigMapRef.current,
          (drafData) => {
            const fileConfig = drafData.get(file);
            fileConfig.loaded = event.loaded;
            fileConfig.total = event.total;
            fileConfig.uploadLoading = false;
          }
        );
        setTimeout(() => {
          refreshView();
        }, 400);
      }
    });
    if (rsp.success) {
      setFileRsp(rsp);
    }
  }
};
export default PFile;
