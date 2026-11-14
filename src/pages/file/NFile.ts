import { CancelTokenSource } from "axios";

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
    type?:string,
    loaded?:number,
    total?:number,
    cancelSource?: CancelTokenSource,
  }
  export interface IOptioncConfig{
    delLoading?:boolean;
    downloadLoading?:boolean;
  }
}
export default NFile;
