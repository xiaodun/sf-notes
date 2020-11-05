import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Row, Space, Typography, Upload } from 'antd';
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
  const [list, setList] = useState<NFile[]>([]);
  const fileConfigMapRef = useRef<Map<File, NFile.IConfig>>(
    new Map(),
  );
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
        {renderLoadingFile()}
        {list.map((item) =>
          renderFileList({
            key: item.id,
            name: item.name,
            uploadLoading: false,
          }),
        )}
      </div>
    </div>
  );
  function renderLoadingFile() {
    const list: ReactNode[] = [];
    fileConfigMapRef.current.forEach((fileConfig, file) => {
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
    } & Partial<NFile.IConfig>,
  ) {
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
            <Button icon={<EyeOutlined />} shape="circle"></Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              shape="circle"
            ></Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              shape="circle"
            ></Button>
          </Space>
        </div>
      </div>
    );
  }
  function customRequest({ file }: RcCustomRequestOptions) {
    fileConfigMapRef.current = produce(
      fileConfigMapRef.current,
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
      setList(rsp.list);
    }
  }
  async function addItem(file: File) {
    const rsp = await SFile.addItem(file, (event) => {
      if (event.loaded !== event.total) {
        fileConfigMapRef.current = produce(
          fileConfigMapRef.current,
          (drafData) => {
            const fileConfig = drafData.get(file);
            fileConfig.loaded = event.loaded;
            fileConfig.total = event.total;
          },
        );
        setRadomkey(Math.random());
      } else {
        fileConfigMapRef.current = produce(
          fileConfigMapRef.current,
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
      setList(rsp.list);
    }
  }
};
export default PFile;
