export interface NProject {
  id?: number;
  name: string;
  rootPath: string;
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
