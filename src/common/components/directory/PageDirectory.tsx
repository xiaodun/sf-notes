import React, { useEffect, PropsWithChildren, useState } from "react";
import SelfStyle from "./PageDirectory.less";
import { Spin, Tree } from "antd";
import SSystem from "@/common/service/SSystem";
import { DataNode, EventDataNode } from "antd/lib/tree";
import { produce } from "immer";
import { NSystem } from "@/common/namespace/NSystem";
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
  const treeHeight = props.height ? props.height : 780;
  const [treeData, setTreeData] = useState([] as IPageDirectoryDataNode[]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [initializing, setInitializing] = useState(false);
  useEffect(() => {
    let ignore = false;
    initTree();
    return () => {
      ignore = true;
    };
    async function initTree() {
      const projectConfigRsp = await SProject.getConfig();
      const projectListRsp = await SProject.getProjectList();
      if (!projectConfigRsp.success || !projectListRsp.success) {
        return;
      }
      const projectConfig = projectConfigRsp.data;
      const projectList = projectListRsp.list || [];
      let nextTreeData = await loadDirectory(undefined, projectConfig, projectList);
      const nextExpandedKeys: React.Key[] = [];
      let nextSelectedKeys: React.Key[] = [];
      if (props.startPath) {
        setInitializing(true);
        const pathChain = buildPathChain(props.startPath);
        for (let i = 0; i < pathChain.length - 1; i++) {
          const currentPath = pathChain[i];
          const children = await loadDirectory(currentPath, projectConfig, projectList);
          nextTreeData = setChildren(nextTreeData, currentPath, children);
          nextExpandedKeys.push(currentPath);
        }
        const selectedPath = pathChain[pathChain.length - 1];
        if (selectedPath) {
          nextSelectedKeys = [selectedPath];
          const selectedNode = findNode(nextTreeData, selectedPath);
          if (selectedNode && props.onSelect) {
            props.onSelect(selectedNode.metaInfo);
          }
        }
      }
      if (ignore) {
        return;
      }
      setTreeData(nextTreeData);
      setExpandedKeys(nextExpandedKeys);
      setSelectedKeys(nextSelectedKeys);
      setInitializing(false);
    }
  }, [props.startPath, props.filter, props.disableFile]);

  const onSelect = (keys: React.Key[], info: any) => {
    setSelectedKeys(keys);
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
    setExpandedKeys(expandedKeys);
    if (info.expanded && !info.node.children) {
      onLoadData({ key: info.node.key });
    }
  };
  async function loadDirectory(
    path: string | undefined,
    projectConfig: NProject.IConfig,
    projectList: NProject[]
  ) {
    const directoryRsp = await SSystem.getFileDirectory(path);
    if (!directoryRsp.success) {
      return [];
    }
    return (directoryRsp.list || [])
      .filter((item) => {
        if (
          path &&
          path == projectConfig.addBasePath &&
          props.filter == "addedProject"
        ) {
          return !projectList.some((project) => project.rootPath.indexOf(item.name) != -1);
        }
        return true;
      })
      .map((item) => {
        const normalizedPath = normalizePath(item.path);
        return {
          isLeaf: item.isLeaf,
          title: item.name,
          key: normalizedPath,
          metaInfo: {
            ...item,
            path: normalizedPath,
          },
          selectable: item.isLeaf ? !props.disableFile : true,
        } as IPageDirectoryDataNode;
      });
  }
  function onLoadData({ key }: any) {
    return (async () => {
      const projectConfigRsp = await SProject.getConfig();
      const projectListRsp = await SProject.getProjectList();
      if (!projectConfigRsp.success || !projectListRsp.success) {
        return;
      }
      const children = await loadDirectory(
        key as string,
        projectConfigRsp.data,
        projectListRsp.list || []
      );
      setTreeData((prev) => setChildren(prev, key as string, children));
    })();
  }
  function setChildren(
    sourceTreeData: IPageDirectoryDataNode[],
    key: string,
    children: IPageDirectoryDataNode[]
  ) {
    return produce(sourceTreeData, (draftState) => {
      const targetNode = findNode(draftState as IPageDirectoryDataNode[], key);
      if (targetNode) {
        targetNode.children = children;
      }
    });
  }
  function findNode(
    sourceTreeData: IPageDirectoryDataNode[],
    key: string
  ): IPageDirectoryDataNode | null {
    for (let i = 0; i < sourceTreeData.length; i++) {
      const node = sourceTreeData[i];
      if ((node.key as string) === key) {
        return node;
      }
      if (node.children && node.children.length) {
        const childNode = findNode(node.children as IPageDirectoryDataNode[], key);
        if (childNode) {
          return childNode;
        }
      }
    }
    return null;
  }
  function buildPathChain(startPath: string) {
    const normalized = normalizePath(startPath);
    const match = normalized.match(/^([A-Za-z]:)\\?(.*)$/);
    if (!match) {
      return [normalized];
    }
    const drive = match[1];
    const rest = match[2];
    const parts = rest.split("\\").filter(Boolean);
    const pathChain: string[] = [`${drive}\\`];
    let current = `${drive}\\`;
    parts.forEach((part) => {
      current = normalizePath(`${current.replace(/\\+$/, "")}\\${part}`);
      pathChain.push(current);
    });
    return pathChain;
  }
  function normalizePath(path: string) {
    const normalized = String(path || "").replace(/\//g, "\\");
    if (/^[A-Za-z]:\\?$/.test(normalized)) {
      return normalized.replace(/\\?$/, "\\");
    }
    return normalized.replace(/\\+$/, "");
  }
  return (
    <div className={SelfStyle.container}>
      <Tree.DirectoryTree
        className={props.className}
        multiple
        height={treeHeight}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        loadData={onLoadData}
        onSelect={onSelect}
        onExpand={onExpand}
        treeData={treeData}
      />
      {initializing && (
        <div className={SelfStyle.loadingWrap}>
          <Spin size="small" />
          <span>正在展开初始路径...</span>
        </div>
      )}
    </div>
  );
};
