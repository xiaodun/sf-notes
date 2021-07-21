import { message } from "antd";
import SBase from "../service/SBase";

export namespace UCopy {
  export interface ICopyOptions {
    //是否使用默认成功处理行为
    useSuccess: boolean;
    useFail: boolean;
  }
  export const defaultCopyOptions: ICopyOptions = {
    useSuccess: true,
    useFail: true,
  };
  export function copyStr(text: string, options = {} as ICopyOptions) {
    const finalOptions = { ...defaultCopyOptions, ...options };
    return new Promise((resolve, reject) => {
      const textarea = document.createElement("textarea");
      textarea.setAttribute("readonly", "readonly");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.setSelectionRange(0, textarea.value.length);
      textarea.select();
      if (document.execCommand("copy")) {
        resolve("success");
      }
      document.body.removeChild(textarea);
    }).then(() => {
      if (finalOptions.useSuccess) {
        message.success("复制成功");
      }
    });
  }
  export function copyImg(
    copyImg: HTMLImageElement,
    options = {} as ICopyOptions
  ) {
    const finalOptions = { ...defaultCopyOptions, ...options };
    return new Promise(async (resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = copyImg.naturalWidth;
      canvas.height = copyImg.naturalHeight;
      const newImg = new Image();

      newImg.crossOrigin = "Anonymous";
      if (copyImg.src.includes("http")) {
        const imgRsp = await (await SBase.getBase64(copyImg.src)).data;
        newImg.src = "data:image/png;base64," + imgRsp;
      } else {
        newImg.src = copyImg.src;
      }
      newImg.onload = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(newImg, 0, 0);
        canvas.toBlob(async (blob) => {
          try {
            //@ts-ignore
            const data = [new ClipboardItem({ [blob.type]: blob })];
            await navigator.clipboard
              //@ts-ignore
              .write(data)
              .then(() => {
                if (finalOptions.useSuccess) {
                  resolve("success");
                  message.success("复制成功");
                }
              })
              .catch((error: any) => {
                console.error(error);

                if (finalOptions.useFail) {
                  message.success("复制失败");
                }
              });
          } catch (error) {
            console.error(error);
            if (finalOptions.useFail) {
              message.success("复制失败");
            }
          }
        });
      };
      newImg.onerror = (error) => {
        console.error(error);
        if (finalOptions.useFail) {
          message.success("复制失败");
        }
      };
    });
  }
}

export default UCopy;
