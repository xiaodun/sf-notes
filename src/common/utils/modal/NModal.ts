export namespace NModal {
  export interface IOptionExecMessage {
    title: string;
    success?: boolean;
    errorMsg: string;
  }
  export interface IOptionConfirmMessage {
    list: string[];
    errorMsg: string;
  }
}
