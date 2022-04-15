export interface NProjectSnippet {
  name: string;
  script?: string;
  isGroup?: boolean;
  children: NProjectSnippet[];
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
    usePathChoose: boolean;
  }
  export interface IParam {
    name: string;
    label: string;
    type: "input" | "switch" | "select" | "number";
    require: boolean;
    disabled: boolean;
    defaultValue: any;
    openChangeRequest?: boolean;
    style?: React.CSSProperties;
    valueList?: { label: string; value: string | number }[];
    props: object;
  }
  export interface IFile {
    name: string;
    path: string;
  }
  export interface IConfig {
    globalParamList: IParam[];
    fragmentList: IFragment[];
    writeOs: IWriteOsConfig;
    openFileList: IFile[];
  }
}

export default NProjectSnippet;
