import React, {
  ReactNode,
  useEffect,
  useRef,
  PropsWithChildren,
} from 'react';
import { Affix, Space } from 'antd';
import SelfStyle from './PageFooter.less';
export interface IPageFooterProps {}
export default (props: PropsWithChildren<IPageFooterProps>) => {
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
