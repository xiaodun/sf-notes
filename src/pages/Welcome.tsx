import PNotes from '@/pages/notes';
import React from 'react';
import SelfStyle from './Welcome.less';
import { Layout } from 'antd';
export default () => {
  return (
    <Layout className={SelfStyle.layput}>
      <Layout.Header className={SelfStyle.header}></Layout.Header>
      <Layout.Content className={SelfStyle.content}>
        <PNotes></PNotes>
      </Layout.Content>
    </Layout>
  );
};
