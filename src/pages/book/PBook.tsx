import { Button, Table } from 'antd';
import React, {
  FC,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import SelfStyle from './LBook.less';
import NBook from './NBook';
import SBook from './SBook';
export interface IPBookProps {}
const PBook: FC<IPBookProps> = (props) => {
  return (
    <div className={SelfStyle.bookWrapper}>
      <Button type="primary" size="large">
        添加
      </Button>
      <Table></Table>
    </div>
  );
};
export default PBook;
