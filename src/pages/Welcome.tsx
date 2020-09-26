import PNotes from '@/pages/notes';
import React, { useState, useEffect, useRef } from 'react';
import SelfStyle from './Welcome.less';
import { Layout } from 'antd';
import moment from 'moment';
import { hh_mm_ss } from '@/common/constant/DateConstant';
export default () => {
  return (
    <Layout className={SelfStyle.layput}>
      <Layout.Header className={SelfStyle.header}>
        <div className={SelfStyle.headerRight}>
          <DateTimeArea></DateTimeArea>
        </div>
      </Layout.Header>
      <Layout.Content className={SelfStyle.content}>
        <PNotes></PNotes>
      </Layout.Content>
    </Layout>
  );
};
const DateTimeArea = () => {
  const [time, setTime] = useState('');
  const timeRef = useRef<number>();
  useEffect(() => {
    timeRef.current = window.setInterval(() => {
      const timeStr = moment().format(hh_mm_ss);
      setTime(timeStr);
    }, 1000);
    return () => {
      window.clearInterval(timeRef.current);
    };
  }, []);
  return <div className={SelfStyle.timeWrapper}>{time}</div>;
};
