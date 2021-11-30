import NSwagger from "@/common/namespace/NSwagger";

export interface NProject {
  id?: number;
  name: string;
  rootPath: string;
  isSfMock: boolean;
  sfMock: {
    programUrl: string;
    startPort: number;
    startBatPath: string;
    nginxPort: number;
    addressPath: string;
    openUrl: string;
  };
  web: {
    isStart: boolean;
  };
}
export namespace NProject {
  export interface IUrlQuery {
    id: number;
  }
  export interface ICommandMenu {
    name: string;
    children?: ICommandMenu[];
  }
  export interface IRenderParameterInfo {
    description: string;
    name: string;
    required: boolean;
    format?: string;
    type?: string;
    enum?: string[];
    schema?: string;
    itemsType?: string;
    children: IRenderParameterInfo[];
  }
  export interface IRenderResponsesInfo {
    type: NSwagger.TType;
    itemsType?: NSwagger.TType;
    description?: string;
    children?: IRenderResponsesInfo[];
    name?: string;
    format?: string;
  }
  export interface IRenderMethodInfo {
    pathUrl: string;
    method: string;
    summary: string;
    tags: string[];
    parameters?: IRenderParameterInfo[];
    responses?: IRenderResponsesInfo;
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
}
export default NProject;
