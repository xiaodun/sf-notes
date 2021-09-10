export namespace UURL {
  export interface IData {
    protocol: string;
    isHttps: boolean;
  }

  export function parseLocationHref(): IData {
    const data = {} as IData;
    data.protocol = window.location.protocol;
    data.isHttps = data.protocol === "https:";
    return data;
  }
}
