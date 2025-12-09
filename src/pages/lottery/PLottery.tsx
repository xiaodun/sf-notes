import React, { useEffect, useRef } from "react";
import { connect, ConnectRC } from "umi";
import { Button, Table, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import NLottery from "./NLottery";
import { MDLottery as MDLotteryActions } from "./models/MDLottery";
import AddLotteryModal, {
  IAddLotteryModal,
} from "./components/AddLotteryModal";

export interface IPLotteryProps {
  MDLottery: {
    rsp: {
      list: NLottery[];
    };
  };
}

const PLottery: ConnectRC<IPLotteryProps> = (props) => {
  const { MDLottery } = props;
  const addLotteryModalRef = useRef<IAddLotteryModal>();

  useEffect(() => {
    document.title = "大乐透";
    NModel.dispatch(new MDLotteryActions.ARGetLotteryList());
  }, []);

  function onAddOk() {
    // 添加成功后不需要刷新列表，因为会直接跳转到投注页面
  }

  return (
    <div>
      <AddLotteryModal ref={addLotteryModalRef} onOk={onAddOk} />

      <Table
        rowKey="id"
        columns={[
          {
            title: "名称",
            key: "name",
            dataIndex: "name",
          },
          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDLottery.rsp.list}
        pagination={false}
      ></Table>
      <PageFooter>
        <Button onClick={showAddModal}>添加预测</Button>
      </PageFooter>
    </div>
  );

  function showAddModal() {
    addLotteryModalRef.current?.showModal(false);
  }

  function renderOptionColumn(_: any, record: NLottery) {
    return (
      <Space>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => {
            window.umiHistory.push(
              `${NRouter.lotteryPredictPath}?id=${record.id}`
            );
          }}
        >
          编辑
        </Button>
        <Button
          type="link"
          icon={<DeleteOutlined />}
          danger
          onClick={() => {
            NModel.dispatch(new MDLotteryActions.ARDelLottery(record.id));
          }}
        >
          删除
        </Button>
      </Space>
    );
  }
};

export default connect((state: any) => ({
  MDLottery: state.MDLottery,
}))(PLottery);
