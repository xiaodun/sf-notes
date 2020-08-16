import React, { ReactNode, useEffect } from 'react';
import { Affix, Space } from 'antd';
import SelfStyle from './PageFooter.less';
export interface IPageFooterProps {
  children: ReactNode;
}
export default (props: IPageFooterProps) => {
  const { children } = props;
  useEffect(() => {}, []);
  return (
    <Affix offsetBottom={0}>
      <Space className={SelfStyle.contentWrapper}>
        {React.Children.map(children, (child) => child)}
      </Space>
    </Affix>
  );
};
