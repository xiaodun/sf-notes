import React, { ReactNode, useEffect, useRef } from 'react';
import { Affix, Space } from 'antd';
import SelfStyle from './PageFooter.less';
export interface IPageFooterProps {
  children: ReactNode;
}
export default (props: IPageFooterProps) => {
  const { children } = props;
  const ref = useRef<Affix>();
  useEffect(() => {
    ref.current.updatePosition();
  });
  return (
    <Affix ref={ref} offsetBottom={0}>
      <Space className={SelfStyle.contentWrapper}>
        {React.Children.map(children, (child) => child)}
      </Space>
    </Affix>
  );
};
