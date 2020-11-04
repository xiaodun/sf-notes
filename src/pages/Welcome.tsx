import React, { useState, useEffect, useRef } from 'react';
import SelfStyle from './Welcome.less';
import { Layout, Space, Button, Modal } from 'antd';
import moment from 'moment';
import UDate from '@/common/utils/UDate';
import { IRouteComponentProps, ConnectRC, connect } from 'umi';
import NRouter from '@/../config/router/NRouter';
import { LeftCircleFilled, QrcodeOutlined } from '@ant-design/icons';
import NApp from './app/NApp';
import { enableMapSet } from 'immer';
enableMapSet();
export const Welcome: ConnectRC<IRouteComponentProps> = (props) => {
  window.umiHistory = props.history;
  window.umiDispatch = props.dispatch;
  useEffect(() => {
    if (!NRouter.isHomePage(props.match.path)) {
      setTimeout(() => {
        const app = NApp.getAppInfoByPath(props.match.path);
        document.title = app.name;
      });
    }
  }, []);
  const actionBtnList = [<QRCodeBtn></QRCodeBtn>];
  return (
    <Layout className={SelfStyle.layput}>
      <Layout.Header className={SelfStyle.header}>
        {!NRouter.isHomePage(props.match.path) && (
          <div
            className={SelfStyle.backs}
            onClick={NRouter.toHomePage}
          >
            <LeftCircleFilled />
          </div>
        )}
        <div className={SelfStyle.actions}>
          <Space size={24}>
            {actionBtnList.map((item, index) => (
              <div key={index} className={SelfStyle.item}>
                {item}
              </div>
            ))}
          </Space>
        </div>
        <div className={SelfStyle.times}>
          <DateTimeArea></DateTimeArea>
        </div>
      </Layout.Header>
      <Layout.Content className={SelfStyle.content}>
        {props.children}
      </Layout.Content>
    </Layout>
  );
};
const DateTimeArea = () => {
  const [time, setTime] = useState('');
  const timeRef = useRef<number>();
  useEffect(() => {
    timeRef.current = window.setInterval(() => {
      const timeStr = moment().format(UDate.hms);
      setTime(timeStr);
    }, 1000);
    return () => {
      window.clearInterval(timeRef.current);
    };
  }, []);
  return <div className={SelfStyle.timeWrapper}>{time}</div>;
};
const QRCodeBtn = () => {
  const QRCode = require('qrcode.react');
  return (
    <Button icon={<QrcodeOutlined />} onClick={showQRcode}></Button>
  );
  function showQRcode() {
    Modal.info({
      icon: null,
      content: (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <QRCode size={256} value={window.location.href} />
        </div>
      ),
      okText: '关闭',
    });
  }
};
export default connect(() => ({}))(Welcome);
