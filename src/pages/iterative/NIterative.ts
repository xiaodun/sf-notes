export interface NIterative {
  id?: number;
  name: string;
  content: string;
  docPassword: string;
  docUrl: string;
  projectList: NIterative.IProject[];
  lastOperationEnvId?: number;

  lastOperationDeployPersonIdList?: number[];
  lastOperationReleasePersonIdList?: number[];
}
export namespace NIterative {
  export interface IProject {
    name: string;
    dir: string;
    branchName: string;
  }
  export interface IReleaseConfig {
    lastOperationSystemId?: number;
    lastOperationBuildAccountId?: number;
    lastOperationDeployAccountId?: number;
  }

  export interface IUrlQuery {
    id: number;
  }
  export interface IGitConfig {
    newBranchDefaultPrefix: string;
  }
  export interface IAccount {
    id?: number;
    systemId: string;
    userName: string;
    password: string;
    personName: string;
    url: string;
    systemName: string;
    envIdList?: string[];
    envNameList?: string[];
  }
  export interface IPerson {
    id?: number;
    name: string;
    roleId: string;
    roleName: string;
    accountList: IAccount[];
  }
  export interface IEnv {
    id?: number;
    envName: string;
    branch: string;
  }
  export interface ISystem {
    id?: number;
    systemName: string;
    url?: string;
    isMoreEnv?: boolean;
    isAddHead?: boolean;
    address?: {
      [key: string]: string;
    };
  }
  export interface IRole {
    id?: number;
    roleName: string;
  }
}
export default NIterative;
