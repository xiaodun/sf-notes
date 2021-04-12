import { message } from 'antd';

export namespace UCopy {
  export interface ICopyOptions {
    //是否使用默认的处理行为
    useSuccess: boolean;
  }
  export const defaultCopyOptions: ICopyOptions = {
    useSuccess: true,
  };
  export function copyStr(
    text: string,
    options = {} as ICopyOptions,
  ) {
    const finalOptions = { ...defaultCopyOptions, ...options };
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.setAttribute('readonly', 'readonly');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.setSelectionRange(0, textarea.value.length);
      textarea.select();
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject();
      }
      document.body.removeChild(textarea);
    }).then(() => {
      if (finalOptions.useSuccess) {
        message.success('复制成功');
      }
    });
  }
}

export default UCopy;
