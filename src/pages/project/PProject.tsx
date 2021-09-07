import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDBook } from "umi";
import qs from "qs";
import SelfStyle from "./LProject.less";
import NProject from "./NProject";
import SProject from "./SProject";
export interface IPBookProps {
  MDBook: NMDBook.IState;
}

const PBook: ConnectRC<IPBookProps> = (props) => {
  useEffect(() => {}, []);

  return <div></div>;
};
export default connect(({ MDBook }: NModel.IState) => ({
  MDBook,
}))(PBook);
