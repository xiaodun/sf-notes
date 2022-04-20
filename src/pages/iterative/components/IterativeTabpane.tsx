import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tag } from "antd";
import React, { FC, useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDIterative } from "umi";
import SIterative from "../SIterative";
import qs from "qs";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";
import NIterative from "../NIterative";

import CreateIterativeModalModal, {
  ICreateIterativeModalModal,
} from "./CreateIterativeModal";
import { CopyOutlined } from "@ant-design/icons";

import ShowSystemInfoModalModal, {
  IShowSystemInfoModalModal,
} from "./ShowSystemInfoModal";

export interface IIterativeTabpaneProps {
  MDIterative: NMDIterative.IState;
}
const IterativeTabpane: FC<IIterativeTabpaneProps> = (props) => {
  const { MDIterative } = props;

  const showSystemInfoModalModalRef = useRef<IShowSystemInfoModalModal>();

  const createIterativeModalModalRef = useRef<ICreateIterativeModalModal>();

  return (
    <div>
      <div style={{ marginTop: "20px", marginBottom: "35px" }}>
        <CreateIterativeModalModal
          ref={createIterativeModalModalRef}
          onOk={SIterative.getIterativeList}
        ></CreateIterativeModalModal>

        <ShowSystemInfoModalModal
          MDIterative={MDIterative}
          ref={showSystemInfoModalModalRef}
        ></ShowSystemInfoModalModal>

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
              render: renderDocUrlColumn,
            },
            {
              title: "文档密码",
              key: "docPassword",
              dataIndex: "docPassword",
              render: renderDocPasswordColumn,
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

        <Button onClick={() => onShowShowSystemInfoModalModal()}>
          系统信息
        </Button>
      </PageFooter>
    </div>
  );

  function onShowShowSystemInfoModalModal() {
    showSystemInfoModalModalRef.current.showModal();
  }

  function onShowCreateIterativeModalModal() {
    createIterativeModalModalRef.current.showModal();
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
      </Space>
    );
  }
};
export default IterativeTabpane;
