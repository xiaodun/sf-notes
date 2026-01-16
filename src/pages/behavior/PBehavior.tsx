import React, { useEffect } from "react";
import SelfStyle from "./LBehavior.less";
import { Card } from "antd";
import { ConnectRC } from "umi";
import NBehavior from "./NBehavior";

export interface PBehaviorProps {}

const PBehavior: ConnectRC<PBehaviorProps> = () => {
  useEffect(() => {
    setTimeout(() => {
      document.title = "行为";
    });
  }, []);

  return (
    <div className={SelfStyle.behaviorContainer}>
      <Card>
        <div className={SelfStyle.content}>
          <h1>行为管理</h1>
          <p>这里可以管理您的行为记录...</p>
        </div>
      </Card>
    </div>
  );
};

export default PBehavior;

