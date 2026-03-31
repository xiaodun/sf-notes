import useRefreshView from "@/common/hooks/useRefreshView";
import { NRsp } from "@/common/namespace/NRsp";
import { UDownload } from "@/common/utils/UDownload";
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  ArrowLeftOutlined,
  EyeOutlined,
  SwapRightOutlined,
} from "@ant-design/icons";
import { Button, Modal, Slider, Space, Typography, Upload, message, Tooltip } from "antd";
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

const MIN_PREVIEW_SCALE = 0.02;
const MAX_PREVIEW_SCALE = 3;
const IMAGE_TRANSFER_STORAGE_KEY = "file.to.image.transfer";

export interface IPFileProps {}
const PFile: FC<IPFileProps> = (props) => {
  const isMobile = Browser.isMobile();
  const [fileRsp, setFileRsp] = useState<NRsp<NFile>>({
    list: [],
  });
  const previewImgRef = useRef<HTMLImageElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uploadConfigMapRef = useRef<Map<File, NFile.IUploadConfig>>(new Map());
  const optionConfigMapRef = useRef<Map<string, NFile.IOptioncConfig>>(
    new Map()
  );
  const [previewRenderedSize, setPreviewRenderedSize] = useState({
    width: 0,
    height: 0,
  });
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
  useEffect(() => {
    if (!previewConfig.visible) {
      return;
    }
    const rafId = window.requestAnimationFrame(() => {
      const rect = previewImgRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      setPreviewRenderedSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    });
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [
    previewConfig.visible,
    previewConfig.scale,
    previewConfig.naturalWidth,
    previewConfig.naturalHeight,
  ]);
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
      {isMobile && (
        <div className={SelfStyle.mobileCameraWrap}>
          <Button type="primary" block onClick={() => cameraInputRef.current?.click()}>
            拍照上传
          </Button>
          <input
            ref={cameraInputRef}
            className={SelfStyle.hiddenInput}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onCameraFileChange}
          />
        </div>
      )}
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
        wrapClassName={SelfStyle.previewModalWrap}
        width="100vw"
        style={{ top: 0, margin: 0, maxWidth: "100vw", paddingBottom: 0 }}
        bodyStyle={{
          height: "calc(100vh - 55px)",
          padding: 0,
          overflow: "hidden",
        }}
        destroyOnClose
        title={
          previewRenderedSize.width ? (
            <span>
              图片预览{" "}
              <span style={{ color: "#888", fontSize: 14, marginLeft: 12 }}>
                ({previewRenderedSize.width} x {previewRenderedSize.height})
              </span>
            </span>
          ) : (
            "图片预览"
          )
        }
      >
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <div
            style={{
              flex: 1,
              overflow: "auto",
              background: "#1f1f1f",
            }}
            onWheel={onPreviewWheel}
          >
            <div
              style={{
                minWidth: "100%",
                minHeight: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                ref={previewImgRef}
                src={previewConfig.src}
                onLoad={(event) => {
                  const { naturalWidth, naturalHeight } = event.currentTarget;
                  const initialScale = Math.min(
                    MAX_PREVIEW_SCALE,
                    Math.max(
                      MIN_PREVIEW_SCALE,
                      Number((375 / Math.max(1, naturalWidth)).toFixed(2))
                    )
                  );
                  setPreviewConfig((prev) => ({
                    ...prev,
                    naturalWidth,
                    naturalHeight,
                    scale: initialScale,
                  }));
                }}
                style={{
                  display: "block",
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
          <div style={{ padding: "12px 24px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <Slider
                  min={MIN_PREVIEW_SCALE}
                  max={MAX_PREVIEW_SCALE}
                  step={0.01}
                  value={previewConfig.scale}
                  onChange={onPreviewSliderChange}
                />
              </div>
              <Button type="primary" onClick={onCopyImage}>
                截图到剪贴板
              </Button>
              <Button onClick={onClosePreview}>关闭</Button>
            </div>
          </div>
        </div>
      </Modal>
      <PageFooter>
        {!isMobile && (
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
        <Typography.Text
          className={SelfStyle.name}
          ellipsis
          onClick={() => {
            if (isImage && params.item) {
              onCopyFileImage(params.item);
            }
          }}
          style={isImage ? { cursor: "pointer" } : undefined}
        >
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
            {!isMobile && isImage && params.item ? (
              <Button
                icon={<EyeOutlined />}
                shape="circle"
                onClick={() => onOpenPreview(params.item)}
              ></Button>
            ) : !isMobile ? (
              <div style={{ width: 32, height: 32 }}></div>
            ) : null}
            {!isMobile && isImage && params.item ? (
              <Tooltip title="转到图片应用">
                <Button
                  icon={<SwapRightOutlined />}
                  shape="circle"
                  onClick={() => onGoToImageManager(params.item)}
                ></Button>
              </Tooltip>
            ) : !isMobile ? (
              <div style={{ width: 32, height: 32 }}></div>
            ) : null}
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
    if (file instanceof File) {
      enqueueUploadFile(file);
    }
  }
  function onGoToImageManager(file: NFile) {
    window.localStorage.setItem(
      IMAGE_TRANSFER_STORAGE_KEY,
      JSON.stringify({
        id: file.id || "",
        name: file.name || "",
      })
    );
    message.loading("正在跳转到图片应用...", 0.8);
    history.push("/image");
  }
  function onCameraFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      enqueueUploadFile(file);
    }
    event.target.value = "";
  }
  function enqueueUploadFile(file: File) {
    uploadConfigMapRef.current = produce(uploadConfigMapRef.current, (drafData) => {
      drafData.set(file, {
        uploadLoading: true,
        loaded: 0,
        total: file.size,
        name: file.name,
      });
    });
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
    setPreviewRenderedSize({
      width: 0,
      height: 0,
    });
  }
  function onClosePreview() {
    setPreviewConfig((prev) => ({
      ...prev,
      visible: false,
    }));
  }
  function onPreviewScaleChange(scale: number) {
    const nextScale = Math.min(
      MAX_PREVIEW_SCALE,
      Math.max(MIN_PREVIEW_SCALE, Number(scale.toFixed(3)))
    );
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
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    onPreviewScaleChange(previewConfig.scale + delta);
  }

  async function onCopyImage() {
    if (!previewConfig.src || !previewConfig.naturalWidth) {
      return;
    }
    try {
      if (!navigator.clipboard || !window.ClipboardItem) {
        throw new Error("当前浏览器不支持剪贴板写入");
      }
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = previewConfig.src;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      const targetWidth =
        previewRenderedSize.width ||
        Math.round(previewConfig.naturalWidth * previewConfig.scale);
      const targetHeight =
        previewRenderedSize.height ||
        Math.round(previewConfig.naturalHeight * previewConfig.scale);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(targetWidth * dpr));
      canvas.height = Math.max(1, Math.round(targetHeight * dpr));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("无法创建 canvas 上下文");
      }
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((data) => {
          if (!data) {
            reject(new Error("图片转换失败"));
            return;
          }
          resolve(data);
        }, "image/png");
      });
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
      message.success("已成功");
    } catch (error) {
      console.error(error);
      message.error("截图复制失败，可能由于跨域限制或浏览器不支持");
    }
  }
  async function onCopyFileImage(file: NFile) {
    try {
      const src = `/${serviceConfig.prefix}/upload/downloadFile?id=${file.id}`;
      await copyImageToClipboard(src);
      message.success("已复制图片到剪贴板");
    } catch (error) {
      message.error("复制图片失败，可能由于浏览器权限限制");
    }
  }
  async function copyImageToClipboard(src: string) {
    if (!navigator.clipboard || !window.ClipboardItem) {
      throw new Error("当前浏览器不支持剪贴板写入");
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, img.naturalWidth || img.width);
    canvas.height = Math.max(1, img.naturalHeight || img.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法创建 canvas 上下文");
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((data) => {
        if (!data) {
          reject(new Error("图片转换失败"));
          return;
        }
        resolve(data);
      }, "image/png");
    });
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
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
