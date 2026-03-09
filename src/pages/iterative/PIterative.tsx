import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import { Tabs, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import { connect, ConnectRC, NMDIterative, history } from "umi";
import SelfStyle from "./LIterative.less";
import SIterative from "./SIterative";
import IterativeTabpane from "./IterativeTabpane";
import RoleTabpane from "./RoleTabPane";
import Browser from "@/utils/browser";

export interface IIterativeProps {
  MDIterative: NMDIterative.IState;
}
const Iterative: ConnectRC<IIterativeProps> = (props) => {
  const { MDIterative } = props;

  useEffect(() => {
    SIterative.getRoleList();
    SIterative.getEnvList();
    SIterative.getSystemList();
    SIterative.getPersonList();
    SIterative.getIterativeList();
  }, []);

  return (
    <div className={SelfStyle.main}>
      <Tabs size="large" type="card">
        <Tabs.TabPane tab="迭代" key="iterative">
          <IterativeTabpane MDIterative={MDIterative}></IterativeTabpane>
        </Tabs.TabPane>
        <Tabs.TabPane tab="角色" key="role">
          <RoleTabpane MDIterative={MDIterative}></RoleTabpane>
        </Tabs.TabPane>
      </Tabs>
      <PageFooter>
        {!Browser.isMobile() && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push("/")}
          >
            返回
          </Button>
        )}
      </PageFooter>
    </div>
  );
};
export default connect(({ MDIterative }: NModel.IState) => ({
  MDIterative,
}))(Iterative);
