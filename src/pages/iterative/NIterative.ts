export interface NIterative {
  id?: number;
  name: string;
  docPassword: string;
  docUrl: string;
  projectList: NIterative.IProject[];
}
export namespace NIterative {
  export interface IProject {
    name: string;
    dir: string;
    branchName: string;
  }
  export interface IConfig {}

  export interface IUrlQuery {
    id: number;
  }
  export interface IGitConfig {
    newBranchDefaultPrefix: string;
  }
  export interface IAccount {
    system: string;
    account: string;
    password: string;
    url: string;
    env?: string;
  }
  export interface IRole {
    id?: number;
    name: string;
    role: string;
    accountList: IAccount[];
  }
  export interface ITag {
    value: string;
    label: string;
  }
}
export default NIterative;
