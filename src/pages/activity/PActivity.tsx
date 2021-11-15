import React, { useEffect, useRef, useState } from "react";
import SelfStyle from "./LActivity.less";
import SActivity from "./SActivity";
import { connect } from "dva";
import { ConnectRC, NMDActivity } from "umi";
import NModel from "@/common/namespace/NModel";
export interface PActivityProps {
  MDActivity: NMDActivity.IState;
}
const PActivity: ConnectRC<PActivityProps> = (props) => {
  useEffect(() => {
    reqGetConfig();
  }, []);
  return <div></div>;
  async function reqGetConfig() {
    const rsp = await SActivity.getList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDActivity.ARSetState({
          list: rsp.list,
        })
      );
    }
  }
};

export default connect(({ MDActivity }: NModel.IState) => ({ MDActivity }))(
  PActivity
);
