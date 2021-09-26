import React, { useEffect, useRef, PropsWithChildren, useState } from "react";
import SelfStyle from "./PageDirectory.less";
import { Tree } from "antd";
import SSystem from "@/common/service/SSystem";
import { DataNode, EventDataNode } from "antd/lib/tree";
import { produce } from "@/common";
import { NSystem } from "@/common/namespace/NSystem";

export interface IPageDirectoryProps {
  startPath?: string;
  height?: number;
  onSelect?: (pathInfos: NSystem.IDirectory) => void;
  className?: string;
}
export interface IPageDirectoryDataNode extends DataNode {
  metaInfo: NSystem.IDirectory;
}
export default (props: PropsWithChildren<IPageDirectoryProps>) => {
  const { children } = props;
  const treeHeight = props.height ? props.height : 780;
  const [treeData, setTreeData] = useState([] as IPageDirectoryDataNode[]);
  useEffect(() => {
    getDirectory(props.startPath);
  }, []);
  const onSelect = (keys: React.Key[], info: any) => {
    const metaInfo = info.node.metaInfo as NSystem.IDirectory;
    props.onSelect && props.onSelect(metaInfo);
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
      console.log("wx", info.node);
      getDirectory(info.node.key as string, info.expanded);
    }
  };
  async function getDirectory(path?: string, expanded: boolean = false) {
    const directoryRsp = await SSystem.getFileDirectory(path);
    if (directoryRsp.success) {
      let list = directoryRsp.list.map((item) => {
        return {
          isLeaf: item.isLeaf,
          title: item.name,
          key: item.path,
          metaInfo: item,
        } as IPageDirectoryDataNode;
      });
      if (expanded) {
        const newTreeData = produce(
          treeData,
          (drafState: IPageDirectoryDataNode[]) => {
            let tempTreeData = drafState;

            while (true) {
              let node = tempTreeData.find((item) => {
                return path.includes(item.key as string);
              });
              if (node) {
                if (node.children && node.children.length > 0) {
                  tempTreeData = node.children as IPageDirectoryDataNode[];
                } else {
                  node.children = list;
                  break;
                }
              } else {
                break;
              }
            }
          }
        );
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
      className={props.className}
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
