import React, { useEffect, useRef, useState } from "react";
import SelfStyle from "./LNovel.less";
import { Button, message, Table } from "antd";
import { ConnectRC } from "umi";
import NNovel from "./NNovel";
import { PageFooter } from "@/common/components/page";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import SNovel from "./SNovel";
import NRsp from "@/common/namespace/NRsp";
import AddNovelModal, { IAddNovelModal } from "./components/AddNovelModal";
import NRouter from "@/../config/router/NRouter";

export interface PNovelProps {}

const PNovel: ConnectRC<PNovelProps> = (props) => {
  const addModalRef = useRef<IAddNovelModal>();
  const [rsp, setRsp] = useState<NRsp<NNovel>>({
    list: [],
    success: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      document.title = "小说";
    });
    reqGetList();
  }, []);

  const reqGetList = async (reset: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await SNovel.getList();
      if (result.success) {
        setRsp(result);
      }
    } catch (error) {
      console.error("获取列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    addModalRef.current?.showModal();
  };

  const handleEdit = (e: React.MouseEvent, item: NNovel) => {
    e.stopPropagation();
    addModalRef.current?.showModal(item);
  };

  const handleDelete = async (e: React.MouseEvent, item: NNovel) => {
    e.stopPropagation();
    if (!item.id) return;
    try {
      const result = await SNovel.delItem(item.id);
      if (result.success) {
        message.success("删除成功");
        reqGetList();
      } else {
        message.error(result.message || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      message.error("删除失败");
    }
  };

  const handleRowClick = (item: NNovel) => {
    if (item.id) {
      window.location.href = `${NRouter.novelPath}/${item.id}`;
    }
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "操作",
      key: "action",
      width: 100,
      render: (_: any, record: NNovel) => (
        <div className={SelfStyle.actionButtons}>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={(e) => handleDelete(e, record)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={SelfStyle.main}>
      <Table
        columns={columns}
        dataSource={rsp.list}
        loading={loading}
        rowKey="id"
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: SelfStyle.tableRow,
        })}
      />
      <PageFooter>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加小说
        </Button>
      </PageFooter>
      <AddNovelModal ref={addModalRef} onOk={reqGetList} />
    </div>
  );
};

export default PNovel;

