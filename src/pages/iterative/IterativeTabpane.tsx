import { PageFooter } from "@/common/components/page";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { FC, useRef } from "react";
import { Link, NMDIterative } from "umi";
import SIterative from "./SIterative";
import qs from "qs";
import UCopy from "@/common/utils/UCopy";
import NIterative from "./NIterative";
import CreateIterativeModalModal, {
  ICreateIterativeModalModal,
} from "./components/CreateIterativeModal";
import { CopyOutlined } from "@ant-design/icons";

import ViewContentModal, {
  IViewContentModal,
} from "./components/ViewContentModal";

export interface IIterativeTabpaneProps {
  MDIterative: NMDIterative.IState;
}
const IterativeTabpane: FC<IIterativeTabpaneProps> = (props) => {
  const { MDIterative } = props;

  const viewContentModalRef = useRef<IViewContentModal>();

  const createIterativeModalModalRef = useRef<ICreateIterativeModalModal>();

  return (
    <div>
      <ViewContentModal ref={viewContentModalRef}></ViewContentModal>

      <div style={{ marginTop: "20px", marginBottom: "35px" }}>
        <CreateIterativeModalModal
          ref={createIterativeModalModalRef}
          onOk={SIterative.getIterativeList}
        ></CreateIterativeModalModal>

        <Table
          rowKey="id"
          columns={[
            {
              title: "迭代名",
              key: "name",
              dataIndex: "name",
              render: renderNameColumn,
            },
            {
              title: "文档链接",
              key: "docUrl",
              dataIndex: "docUrl",
              ellipsis: true,
              render: renderDocUrlColumn,
            },
            {
              title: "文档密码",
              key: "docPassword",
              dataIndex: "docPassword",
              render: renderDocPasswordColumn,
            },
            {
              title: "分享人",
              key: "sharePerson",
              dataIndex: "sharePerson",
            },

            {
              title: "操作",
              key: "_option",
              render: renderOptionColumn,
            },
          ]}
          dataSource={MDIterative.rsp.list}
          pagination={false}
        ></Table>
      </div>
      <PageFooter>
        <Button onClick={() => onShowCreateIterativeModalModal()}>
          创建迭代
        </Button>
      </PageFooter>
    </div>
  );

  function onShowCreateIterativeModalModal() {
    createIterativeModalModalRef.current.showModal();
  }

  function onShowViewContentModal(iterative: NIterative) {
    viewContentModalRef.current.showModal(iterative.content);
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderDocUrlColumn(docUrl: string) {
    return (
      <div>
        <CopyOutlined onClick={() => UCopy.copyStr(docUrl)}></CopyOutlined>
        &nbsp;&nbsp;<a href={docUrl}>{docUrl}</a>
      </div>
    );
  }
  function renderDocPasswordColumn(docPassword: string) {
    return <div onClick={() => UCopy.copyStr(docPassword)}>{docPassword}</div>;
  }
  function renderOptionColumn(iterative: NIterative) {
    return (
      <Space>
        <Button type="link">
          <Link
            to={{
              pathname: NRouter.iterativeReleasePath,
              search: qs.stringify({ id: iterative.id }),
            }}
            target="_blank"
          >
            发版
          </Link>
        </Button>

        <Button type="link" onClick={() => onShowViewContentModal(iterative)}>
          信息展示
        </Button>
        <Button type="link" onClick={() => onDel(iterative)}>
          删除
        </Button>
      </Space>
    );
  }
  async function onDel(iterative: NIterative) {
    const rsp = await SIterative.delIterative(iterative.id);
    if (rsp.success) {
      SIterative.getIterativeList();
    }
  }
};
export default IterativeTabpane;
