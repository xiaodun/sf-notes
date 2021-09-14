import React, { useEffect, useRef, PropsWithChildren, useState } from "react";
import SelfStyle from "./PageDirectory.less";
import { Tree } from "antd";
import SSystem from "@/common/service/SSystem";
import { DataNode, EventDataNode } from "antd/lib/tree";
import { produce } from "@/common";

export interface IPageDirectoryProps {
  startPath?: string;
  height?: number;
}
export default (props: PropsWithChildren<IPageDirectoryProps>) => {
  const { children } = props;
  const treeHeight = props.height ? props.height : 780;
  const [treeData, setTreeData] = useState([] as DataNode[]);
  useEffect(() => {
    getDirectory(props.startPath);
  }, []);
  const onSelect = (keys: React.Key[], info: any) => {
    console.log("Trigger Select", keys, info);
  };

  const onExpand = (
    expandedKeys: (string | number)[],
    info: {
      node: EventDataNode;
      expanded: boolean;
      nativeEvent: MouseEvent;
    }
  ) => {
    if (info.expanded && !info.node.children) {
      getDirectory(info.node.key as string, info.expanded, info.node);
    }
  };
  async function getDirectory(path?: string, expanded: boolean = false) {
    const directoryRsp = await SSystem.getFileDirectory(path);
    if (directoryRsp.success) {
      let list = directoryRsp.list.map((item) => {
        return {
          isLeaf: item.isLeaf,
          selectable: item.isLeaf,
          title: item.name,
          key: item.path,
          metaInfo: item,
        } as DataNode;
      });
      if (expanded) {
        const newTreeData = produce(treeData, (drafState: DataNode[]) => {
          let tempTreeData = drafState;
          while (true) {
            let node = tempTreeData.find((item) =>
              path.includes(item.key as string)
            );
            if (node) {
              if (node.children && node.children.length > 0) {
                tempTreeData = node.children;
              } else {
                node.children = list;
                break;
              }
            } else {
              break;
            }
          }
        });
        setTreeData(newTreeData);
      } else {
        setTreeData(list);
      }
    }
  }
  function onLoadData({ key }: any) {
    return getDirectory(key, true);
  }
  return (
    <Tree.DirectoryTree
      multiple
      height={treeHeight}
      defaultExpandAll
      loadData={onLoadData}
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
    />
  );
};
