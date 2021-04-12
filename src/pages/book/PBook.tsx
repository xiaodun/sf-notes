import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect } from "react";
import { connect, ConnectRC, NMDBook } from "umi";
import qs from "qs";
import SelfStyle from "./LBook.less";
import NBook from "./NBook";
import SBook from "./SBook";
import UDate from "@/common/utils/UDate";
export interface IPBookProps {
  MDBook: NMDBook.IState;
}
const PBook: ConnectRC<IPBookProps> = (props) => {
  const { MDBook } = props;

  useEffect(() => {
    reqGetList();
  }, []);

  return (
    <div className={SelfStyle.bookWrapper}>
      <Table
        rowKey="id"
        columns={[
          {
            title: "书籍名",
            key: "name",
            dataIndex: "name",
          },
          {
            title: "创建时间",
            key: "createTime",
            dataIndex: "createTime",
            render: renderCreateTime,
          },
          {
            title: "操作",
            key: "_option",
            render: renderOption,
          },
        ]}
        dataSource={MDBook.rsp.list}
        pagination={null}
      ></Table>
      <PageFooter>
        <Button onClick={() => onEditBook()}>添加书籍</Button>
      </PageFooter>
    </div>
  );
  async function reqGetList() {
    const rsp = await SBook.getList();
    if (rsp.success) {
      NModel.dispatch(new NMDBook.ARSetRsp(rsp));
    }
  }
  function onEditBook(book = {} as NBook) {
    props.history.push({
      pathname: NRouter.bookEditPath,
      search: qs.stringify({ id: book.id }),
    });
  }
  function renderCreateTime(createTime: number) {
    return UDate.fomat(createTime, UDate.ymdhms);
  }
  function renderOption(book: NBook) {
    return (
      <Space align="start">
        <Button type="link" onClick={() => onEditBook(book)}>
          编辑
        </Button>
        {/* <Button type="link">删除</Button> */}
      </Space>
    );
  }
};
export default connect(({ MDBook }: NModel.IState) => ({
  MDBook,
}))(PBook);
