import { message } from 'antd';

export namespace UDownload {
  export interface IDownloadOptions {
    //是否使用默认的处理行为
    useSuccess: boolean;
  }
  export const defaultDownloadOptions: IDownloadOptions = {
    useSuccess: true,
  };

  function resolveDownloadUrl(url: string) {
    if (/^https?:\/\//.test(url)) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? url : `/${url}`}`;
  }

  export function download(
    params: {
      name: string;
      blob?: Blob;
      url?: string;
    },
    options = {} as IDownloadOptions,
  ) {
    const finalOptions = { ...defaultDownloadOptions, ...options };

    if (params.url) {
      return new Promise<void>((resolve) => {
        const a = document.createElement('a');
        a.href = resolveDownloadUrl(params.url);
        a.download = params.name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
        resolve();
      }).then(() => {
        if (finalOptions.useSuccess) {
          message.success('已经开始下载');
        }
      });
    }

    if (!params.blob) {
      return Promise.reject(new Error('缺少可下载内容'));
    }

    return new Promise<void>((resolve) => {
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
