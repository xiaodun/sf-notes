import { NRsp } from '@/common/namespace/NRsp';
import { UDownload } from '@/common/utils/UDownload';
import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Space, Typography, Upload } from 'antd';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import produce from 'immer';
import { floor } from 'lodash';
import React, {
  FC,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import SelfStyle from './LFile.less';
import NFile from './NFile';
import SFile from './SFile';
export interface IPFileProps {}
const PFile: FC<IPFileProps> = (props) => {
  const [fileRsp, setFileRsp] = useState<NRsp<NFile>>({
    list: [],
  });
  const uploadConfigMapRef = useRef<Map<File, NFile.IUploadConfig>>(
    new Map(),
  );
  const optionConfigMapRef = useRef<
    Map<string, NFile.IOptioncConfig>
  >(new Map());
  const [radomKey, setRadomkey] = useState<number>();
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
        <p className="ant-upload-text">点击或拖拽上传</p>
      </Upload.Dragger>
      <div className={SelfStyle.fileListWrap}>
        {renderUploadFileList()}
        {fileRsp.list.map((item) =>
          renderFileList({
            key: item.id,
            name: item.name,
            item,
            uploadLoading: false,
          }),
        )}
      </div>
    </div>
  );
  function renderUploadFileList() {
    const list: ReactNode[] = [];
    uploadConfigMapRef.current.forEach((fileConfig, file) => {
      if (fileConfig.uploadLoading) {
        list.push(
          renderFileList({
            key: file,
            ...fileConfig,
          }),
        );
      }
    });
    return list;
  }
  function renderFileList(
    params: {
      key: any;
      item?: NFile;
    } & Partial<NFile.IUploadConfig>,
  ) {
    const optionConfig = optionConfigMapRef.current.get(params.key);
    return (
      <div key={params.key} className={SelfStyle.itemWrap}>
        <Typography.Text className={SelfStyle.name} ellipsis>
          {params.name}
        </Typography.Text>
        <div
          className={SelfStyle.actions}
          style={{
            visibility: params.uploadLoading ? 'hidden' : 'visible',
          }}
        >
          {params.uploadLoading && (
            <div className={SelfStyle.loadingWrap}>
              {floor((params.loaded * 100) / params.total, 2)}%
            </div>
          )}
          <Space size={26}>
            {/* <Button icon={<EyeOutlined />} shape="circle"></Button> */}
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
    setRadomkey(Math.random());
    SFile.downloadItem(file.id).then((rsp) => {
      const optionConfig = optionConfigMapRef.current.get(file.id);
      optionConfig.downloadLoading = false;
      setRadomkey(Math.random());
      UDownload.download({ name: file.name, blob: rsp });
    });
  }
  function onDelFile(file: NFile) {
    optionConfigMapRef.current.set(file.id, { delLoading: true });
    setRadomkey(Math.random());
    SFile.delItem(file.id).then((rsp) => {
      if (rsp.success) {
        const optionConfig = optionConfigMapRef.current.get(file.id);
        optionConfig.delLoading = false;
        setFileRsp(
          NRsp.delItem(fileRsp, (item) => item.id === file.id),
        );
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
      },
    );
    setRadomkey(Math.random());
    addItem(file);
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
          },
        );
        setRadomkey(Math.random());
      } else {
        uploadConfigMapRef.current = produce(
          uploadConfigMapRef.current,
          (drafData) => {
            const fileConfig = drafData.get(file);
            fileConfig.loaded = event.loaded;
            fileConfig.total = event.total;
            fileConfig.uploadLoading = false;
          },
        );
        setTimeout(() => {
          setRadomkey(Math.random());
        }, 400);
      }
    });
    if (rsp.success) {
      setFileRsp(rsp);
    }
  }
};
export default PFile;
