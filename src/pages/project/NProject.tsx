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
}
export default NProject;
