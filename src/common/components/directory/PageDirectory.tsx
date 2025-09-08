import React, { useEffect, useRef, PropsWithChildren, useState } from "react";
import SelfStyle from "./PageDirectory.less";
import { Tree } from "antd";
import SSystem from "@/common/service/SSystem";
import { DataNode, EventDataNode } from "antd/lib/tree";
import { produce } from "immer";
import { NSystem } from "@/common/namespace/NSystem";
import NModel from "@/common/namespace/NModel";
import { NMDProject } from "umi";
import SProject from "../../../pages/project/SProject";
import NProject from "../../../pages/project/NProject";

export type TFilter = "addedProject";
export interface IPageDirectoryProps {
  startPath?: string;
  filter?: TFilter;
  disableFile?: boolean;
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
      getDirectory(info.node.key as string, info.expanded);
    }
  };
  async function getDirectory(path?: string, expanded: boolean = false) {
    const projectConfig = (await SProject.getConfig()).data;
    const projectList = (await SProject.getProjectList()).list;
    const directoryRsp = await SSystem.getFileDirectory(path);

    if (directoryRsp.success) {
      let list = directoryRsp.list
        .filter((item) => {
          if (
            path &&
            path == projectConfig.addBasePath &&
            props.filter == "addedProject"
          ) {
            return !projectList.some(
              (project) => project.rootPath.indexOf(item.name) != -1
            );
          }
          return true;
        })
        .map((item) => {
          return {
            isLeaf: item.isLeaf,

            title: item.name,
            key: item.path,
            metaInfo: item,
            selectable: item.isLeaf ? !props.disableFile : true,
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
