import { PageFooter } from '@/common/components/page';
import { NConnect } from '@/common/namespace/NConnect';
import NModel from '@/common/namespace/NModel';
import UDate from '@/common/utils/UDate';
import { Button, Space, Table } from 'antd';
import React, { FC, useEffect } from 'react';
import { connect, NMDBook } from 'umi';
import SelfStyle from './LBook.less';
import SBook from './SBook';
export interface IPBookProps {
  MDBook: NMDBook.IState;
}
const PBook: FC<IPBookProps> = (props) => {
  const { MDBook } = props;

  useEffect(() => {
    reqGetList();
  }, []);
  async function reqGetList() {
    const rsp = await SBook.getList();
    if (rsp.success) {
      NModel.dispatch(new NMDBook.ARSetRsp(rsp));
    }
  }
  return (
    <div className={SelfStyle.bookWrapper}>
      <Table
        rowKey="id"
        columns={[
          {
            title: '书籍名',
            key: 'name',
            dataIndex: 'name',
          },
          {
            title: '创建时间',
            key: 'createTime',
            dataIndex: 'createTime',
            render: renderCreateTime,
          },
          {
            title: '操作',
            key: '_option',
            render: renderOption,
          },
        ]}
        dataSource={MDBook.rsp.list}
        pagination={null}
      ></Table>
      <PageFooter>
        <Button>添加书籍</Button>
      </PageFooter>
    </div>
  );
  function renderCreateTime(createTime: number) {
    return UDate.fomat(createTime, UDate.ymdhms);
  }
  function renderOption() {
    return (
      <Space align="start">
        <Button type="link">编辑</Button>
        <Button type="link">删除</Button>
      </Space>
    );
  }
};
export default connect(({ MDBook }: NModel.IState) => ({
  MDBook,
}))(PBook);
