import { Input } from 'antd';

import React, { FC, ReactNode, useEffect, useRef, useState } from 'react';
import SelfStyle from './PQrCode.less';
import QRCode from 'qrcode.react';
export interface IPQrCodeProps {}
const PQrCode: FC<IPQrCodeProps> = (props) => {
  const [url, setUrl] = useState('');
  return (
    <div className={SelfStyle.main}>
      <Input
        placeholder="请输入链接地址"
        value={url}
        onChange={(event) => setUrl(event.target.value.trim())}
      ></Input>
      <div className={SelfStyle.qrCodeWrap}>
        {url && <QRCode src={''} value={url} size={200} fgColor="#000000" />}
      </div>
    </div>
  );
};
export default PQrCode;
