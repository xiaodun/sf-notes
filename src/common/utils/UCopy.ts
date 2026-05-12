import { message } from "antd";
import SBase from "../service/SBase";

export namespace UCopy {
  export interface ICopyOptions {
    useSuccess: boolean;
    useFail: boolean;
  }
  export const defaultCopyOptions: ICopyOptions = {
    useSuccess: true,
    useFail: true,
  };

  const COPIED = "已复制";

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
        message.success(COPIED);
      }
    });
  }

  export function clipboardRichWriteSupported(): boolean {
    return (
      typeof ClipboardItem !== "undefined" &&
      typeof window !== "undefined" &&
      window.isSecureContext === true &&
      Boolean(navigator.clipboard?.write)
    );
  }

  async function imageSrcToBlob(src: string): Promise<Blob | null> {
    if (src.startsWith("data:")) {
      const res = await fetch(src);
      return res.blob();
    }
    if (/^https?:\/\//i.test(src)) {
      const rsp = await SBase.getBase64(src);
      const b64 = rsp?.data as string | undefined;
      if (!b64) {
        return null;
      }
      const res = await fetch("data:image/png;base64," + b64);
      return res.blob();
    }
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      const newImg = new Image();
      newImg.crossOrigin = "anonymous";
      newImg.onload = () => {
        canvas.width = newImg.naturalWidth;
        canvas.height = newImg.naturalHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(newImg, 0, 0);
        canvas.toBlob((blob) => resolve(blob), "image/png");
      };
      newImg.onerror = () => reject(new Error("image load failed"));
      newImg.src = src;
    });
  }

  export function copyImg(
    copyImg: HTMLImageElement,
    options = {} as ICopyOptions,
  ) {
    const finalOptions = { ...defaultCopyOptions, ...options };
    return new Promise(async (resolve, reject) => {
      if (!copyImg?.src) {
        if (finalOptions.useFail) {
          message.error("复制失败");
        }
        reject(new Error("empty src"));
        return;
      }

      if (!clipboardRichWriteSupported()) {
        if (finalOptions.useFail) {
          message.error("复制失败");
        }
        reject(new Error("clipboard image not supported"));
        return;
      }

      try {
        if (copyImg.decode) {
          try {
            await copyImg.decode();
          } catch {
            /* ignore */
          }
        }
        const blob = await imageSrcToBlob(copyImg.src);
        if (!blob || blob.size === 0) {
          throw new Error("empty blob");
        }
        const type = blob.type && blob.type.startsWith("image/")
          ? blob.type
          : "image/png";
        await navigator.clipboard.write([
          new ClipboardItem({ [type]: blob }),
        ]);
        if (finalOptions.useSuccess) {
          message.success(COPIED);
        }
        resolve("success");
      } catch (error) {
        console.error(error);
        if (finalOptions.useFail) {
          message.error("复制失败");
        }
        reject(error);
      }
    });
  }

  /**
   * 同时写入 text/html 与 text/plain。
   * 若只写 html，微信等客户端常忽略网页来源的 HTML，粘贴为空或只剩空行。
   */
  export function copyHtmlPlain(
    html: string,
    plainFallback: string,
    options = {} as ICopyOptions,
  ): Promise<void> {
    const finalOptions = { ...defaultCopyOptions, ...options };
    if (!clipboardRichWriteSupported()) {
      return copyStr(plainFallback, finalOptions) as Promise<void>;
    }
    const htmlBlob = new Blob([html], { type: "text/html" });
    const plain =
      plainFallback.trim().length > 0 ? plainFallback : "\n";
    const plainBlob = new Blob([plain], { type: "text/plain" });
    return navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": plainBlob,
        }),
      ])
      .then(() => {
        if (finalOptions.useSuccess) {
          message.success(COPIED);
        }
      })
      .catch((e) => {
        console.error(e);
        return copyStr(plainFallback, {
          ...finalOptions,
          useFail: false,
        }) as Promise<void>;
      }) as Promise<void>;
  }
}

export default UCopy;
