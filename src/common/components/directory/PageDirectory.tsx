import React, { useEffect, useRef, PropsWithChildren, useState } from "react";
import SelfStyle from "./PageDirectory.less";
import { Tree } from "antd";
import SSystem from "@/common/service/SSystem";
import { DataNode } from "antd/lib/tree";

export interface IPageDirectoryProps {
  startPath?: string;
}
export default (props: PropsWithChildren<IPageDirectoryProps>) => {
  const { children } = props;
  const [treeData, setTreeData] = useState([] as DataNode[]);
  useEffect(() => {
    getDirectory(props.startPath);
  }, []);
  const onSelect = (keys: React.Key[], info: any) => {
    console.log("Trigger Select", keys, info);
  };

  const onExpand = () => {
    console.log("Trigger Expand");
  };
  async function getDirectory(path?: string) {
    const directoryRsp = await SSystem.getFileDirectory(path);
    if (directoryRsp.success) {
      let list = directoryRsp.list.map((item) => {
        return {
          isLeaf: item.isLeaf,
          title: item.name,
          key: item.path,
          metaInfo: item,
        } as DataNode;
      });
      setTreeData(list);
    }
  }
  return (
    <Tree.DirectoryTree
      multiple
      defaultExpandAll
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
    />
  );
};
