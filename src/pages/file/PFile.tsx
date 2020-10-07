import { InboxOutlined } from '@ant-design/icons';
import Dragger from 'antd/lib/upload/Dragger';
import React, { FC } from 'react';

import SelfStyle from './LFile.less';
export interface IPFileProps {}
const PFile: FC<IPFileProps> = (props) => {
  return (
    <div>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibit from
          uploading company data or other band files
        </p>
      </Dragger>
    </div>
  );
};
export default PFile;
