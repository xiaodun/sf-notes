import React, { useEffect, useRef, useState } from "react";
import SelfStyle from "./LBehavior.less";
import { Button } from "antd";
import { ConnectRC } from "umi";
import NBehavior from "./NBehavior";
import { PageFooter } from "@/common/components/page";
import { PlusOutlined } from "@ant-design/icons";
import AddBehaviorModal, { IAddBehaviorModal } from "./components/AddBehaviorModal";
import SBehavior from "./SBehavior";
import NRsp from "@/common/namespace/NRsp";

export interface PBehaviorProps {}

const PBehavior: ConnectRC<PBehaviorProps> = () => {
  const addModalRef = useRef<IAddBehaviorModal>();
  const [rsp, setRsp] = useState<NRsp<NBehavior>>({
    list: [],
    success: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      document.title = "行为";
    });
    reqGetList();
  }, []);

  const reqGetList = async (reset: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await SBehavior.getList();
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

  const handleSaveSuccess = async () => {
    // 刷新列表数据
    await reqGetList(true);
  };

  return (
    <div className={SelfStyle.behaviorContainer}>
      <div className={SelfStyle.listContainer}>
        {rsp.list && rsp.list.length > 0 ? (
          rsp.list.map((item, index) => (
            <div key={item.id || index} className={SelfStyle.behaviorItem}>
              <div className={SelfStyle.behaviorName}>{item.name}</div>
              {item.encrypted && (
                <div className={SelfStyle.encryptedTag}>已加密</div>
              )}
              <div className={SelfStyle.behaviorTime}>
                {new Date(item.createTime).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className={SelfStyle.emptyState}>
            <p>暂无数据，点击下方按钮添加第一条吧！</p>
          </div>
        )}
      </div>

      <PageFooter>
        <Button
          onClick={handleAdd}
          type="primary"
          icon={<PlusOutlined />}
        >
          添加
        </Button>
      </PageFooter>

      <AddBehaviorModal
        onOk={handleSaveSuccess}
        ref={addModalRef}
        rsp={rsp}
      />
    </div>
  );
};

export default PBehavior;

