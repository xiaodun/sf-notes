export interface NProjectSnippet {
  name: string;
  script: string;
}

export namespace NProjectSnippet {
  export interface IFragment {
    title: string;
    openCode: boolean;
    previewAbleName: string;
    template: string;
  }
  export interface IWriteOsConfig {
    open: boolean;
    needFolder: boolean;
    basePath: string;
  }
  export interface IWriteResult {
    title: string;
    success: boolean;
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
