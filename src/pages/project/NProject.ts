import NSwagger from "@/common/namespace/NSwagger";
import NProjectSnippet from "./snippet/NProjectSnippet";

export interface NProject {
  id?: number;
  name: string;
  rootPath: string;
  isSfMock: boolean;
  isDefault: boolean;
  notJoinIterative?: boolean;
  sfMock: {
    programUrl: string;
    startPort: number;
    startBatPath: string;
    serverList: {
      name: string;
      openUrl: string;
      openDomainUrl: string;
      webOpenUrl?: string;
      isMock?: boolean;
      port?: number;
    }[];
    addressPath: string;
    openUrl: string;
  };
  startConfig?: {
    commands: {
      name: string;
      command: string;
    }[];
    runUrl: string;
  };
  snippetList: NProjectSnippet[];
  web: {
    isStart: boolean;
  };
}
export namespace NProject {
  export type TMenuTabKey = "attention" | "domain";
  export interface IInExcludeGroups {
    [key: string]: string[];
  }
  export interface IMockConfig {
    programUrl: string;
    programPrefix: string;
  }
  export interface IConfig {
    addBasePath: string;
    nginxVisitWay: "ip" | "domain";
    showEnumList: false;
    gitlabBasePath: string;
    lastOptionSwaggerDomain: string;
    swaggerPathShowWay: "path" | "desc";
  }

  export interface IAjaxCode {
    name: string;
    data: string;
  }
  export interface IApiWithPrefix {
    [key: string]: {
      prefix: string;
    };
  }
  export interface IDomainSwagger {
    id?: number;
    domain: string;
    createTime?: number;
    updateTime?: number;
    data: IRenderSwaggerInfo;
  }
  export interface IUrlQuery {
    id: number;
    script: string;
  }
  export interface IRenderFormatInfo {
    key: string;
    description?: string;
    name: string;
    required?: boolean;
    format?: string;
    type?: NSwagger.TType;
    enum?: string[];
    schema?: string;
    itemsType?: string;
    children: IRenderFormatInfo[];
  }
  export interface IRenderMethodInfo {
    notFound?: boolean;

    pathUrl: string;
    method: string;
    summary: string;
    tags: string[];
    parameters?: IRenderFormatInfo[];
    responses?: IRenderFormatInfo[];
  }
  export interface IRenderSwaggerInfo {
    [key: string]: {
      groupName: string;
      tags: {
        [key: string]: {
          tagName: string;
          paths: {
            [key: string]: IRenderMethodInfo;
          };
        };
      };
    };
  }
  export interface IAttentionInfo {
    hasMoreTag: boolean;
    list: IMenuCheckbox[];
    tagInfos: {
      [key: string]: IMenuCheckbox[];
    };
  }
  export interface IMenuCheckbox {
    domain: string;
    groupName: string;
    tagName: string;
    /** paths 对象中的键，含方法：`get:/api/foo`；旧数据可能仅有 pathUrl */
    pathKey?: string;
    pathUrl?: string;
    /** 关注列表旧数据兼容：多方法同 path 时可辅助定位 */
    method?: string;
    /** Swagger 分组（group）级全选 */
    isGroup?: boolean;
    isTag?: boolean;
    isPath?: boolean;
    data?: NProject.IRenderMethodInfo;
  }
}
export default NProject;
