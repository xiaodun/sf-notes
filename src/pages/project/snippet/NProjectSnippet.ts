export interface NProjectSnippet {
  name: string;
  script: string;
}

export namespace NProjectSnippet {
  export interface IExtractionResult {
    enumList: string[];
    enumStr: string;
    values: Object;
    valueStr: string;
  }
  export interface IFragment {
    title: string;
    noTemplate: boolean;
    template?: string;
  }
  export interface IWriteOsConfig {
    open: boolean;
    needFolder: boolean;
    basePath: string;
  }
  export interface IWriteResult {
    title: string;
    success: boolean;
    errorMsg: string;
  }
  export interface IParam {
    name: string;
    label: string;
    type: "input" | "switch";
    require: boolean;
    defaultValue: any;
    style?: React.CSSProperties;
  }
  export interface IConfig {
    globalParamList: IParam[];
    fragmentList: IFragment[];
    writeOs: IWriteOsConfig;
  }
}

export default NProjectSnippet;