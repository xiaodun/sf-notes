import PageNotes from '@/pages/notes';
import React from 'react';
import SelfStyle from './Welcome.less';
import { Layout } from 'antd';
export default () => {
  return (
    <Layout className={SelfStyle.layput}>
      <Layout.Header className={SelfStyle.header}>头部</Layout.Header>
      <Layout.Content className={SelfStyle.content}>
        <PageNotes></PageNotes>
      </Layout.Content>
    </Layout>
  );
};
