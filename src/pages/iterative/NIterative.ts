export interface NIterative {
  name: string;
  docPassword: string;
  docUrl: string;
}
export namespace NIterative {
  export interface IConfig {}

  export interface IRole {
    name: string;
    role: string;
  }
  export interface IRoleTag {
    value: string;
    label: string;
  }
}
export default NIterative;
