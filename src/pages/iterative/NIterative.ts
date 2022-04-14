export interface NIterative {
  name: string;
  docPassword: string;
  docUrl: string;
}
export namespace NIterative {
  export interface IConfig {}

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
