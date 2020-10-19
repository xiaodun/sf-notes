import {
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Button, Row, Space, Typography, Upload } from 'antd';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import React, { FC, useEffect, useState } from 'react';

import SelfStyle from './LFile.less';
import NFile from './NFile';
import SFile from './SFile';
export interface IPFileProps {}
const PFile: FC<IPFileProps> = (props) => {
  const [list, setList] = useState<NFile[]>([]);
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
        {list.map((item) => (
          <div key={item.id} className={SelfStyle.itemWrap}>
            <Typography.Text className={SelfStyle.name} ellipsis>
              {item.name}
            </Typography.Text>
            <div className={SelfStyle.actions}>
              <Space size={26}>
                <Button
                  icon={<EyeOutlined />}
                  shape="circle"
                ></Button>
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
        ))}
      </div>
    </div>
  );
  function customRequest({ file }: RcCustomRequestOptions) {
    addItem(file);
  }
  async function getList() {
    const rsp = await SFile.getList();
    if (rsp.success) {
      setList(rsp.list);
    }
  }
  async function addItem(file: File) {
    const rsp = await SFile.addItem(file);
    if (rsp.success) {
      // setList(rsp.list);
    }
  }
};
export default PFile;
