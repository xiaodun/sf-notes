import PNotes from '@/pages/notes';
import React, { useState, useEffect, useRef } from 'react';
import SelfStyle from './Welcome.less';
import { Layout } from 'antd';
import moment from 'moment';
import UDate from '@/common/utils/UDate';
import PApp from './app/PApp';
export default () => {
  return (
    <Layout className={SelfStyle.layput}>
      <Layout.Header className={SelfStyle.header}>
        <div className={SelfStyle.headerRight}>
          <DateTimeArea></DateTimeArea>
        </div>
      </Layout.Header>
      <Layout.Content className={SelfStyle.content}>
        <PApp></PApp>
      </Layout.Content>
    </Layout>
  );
};
const DateTimeArea = () => {
  const [time, setTime] = useState('');
  const timeRef = useRef<number>();
  useEffect(() => {
    timeRef.current = window.setInterval(() => {
      const timeStr = moment().format(UDate.hh_mm_ss);
      setTime(timeStr);
    }, 1000);
    return () => {
      window.clearInterval(timeRef.current);
    };
  }, []);
  return <div className={SelfStyle.timeWrapper}>{time}</div>;
};
