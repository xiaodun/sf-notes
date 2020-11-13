import { message } from 'antd';

export namespace UDownload {
  export interface IDownloadOptions {
    //是否使用默认的处理行为
    useSuccess: boolean;
  }
  export const defaultDownloadOptions: IDownloadOptions = {
    useSuccess: true,
  };
  export function download(
    params: {
      name: string;
      blob: Blob;
    },
    options = {} as IDownloadOptions,
  ) {
    const finalOptions = { ...defaultDownloadOptions, ...options };
    return new Promise((resolve) => {
      const a = document.createElement('a');
      a.download = params.name;
      a.href = URL.createObjectURL(params.blob);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      resolve();
    }).then(() => {
      if (finalOptions.useSuccess) {
        message.success('已经开始下载');
      }
    });
  }
}
