export interface NFile {
  name: string;
  type: string;
  flag: string;
  id: string;
}
export namespace NFile{
  export interface IUploadConfig{
    uploadLoading:boolean
    name:string,
    loaded?:number,
    total?:number,
  }
  export interface IOptioncConfig{
    delLoading:boolean
  }
}
export default NFile;
