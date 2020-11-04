export interface NFile {
  name: string;
  type: string;
  flag: string;
  id: string;
}
export namespace NFile{
  export interface IConfig{
    uploadLoading:boolean
    name:string,
    loaded?:number,
    total?:number,
  }
}
export default NFile;
