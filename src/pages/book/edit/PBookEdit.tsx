import React, { FC, ReactNode } from "react";
import { ConnectRC } from "umi";
import SelfStyle from "./PBookEdit.less";
export interface IPBookEditProps {}
const PBookEdit: ConnectRC<IPBookEditProps> = (props) => {
  return <div>编辑页面</div>;
};
export default PBookEdit;
