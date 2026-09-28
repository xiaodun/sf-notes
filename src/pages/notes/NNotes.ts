export interface NNotes {
  content: string;
  base64: Object;
  createTime: number;
  id?: string;
  updateTime: string;
  title: string;
  titleColor?: string;
  /** 正文字号(px)，缺省表示用默认字号 */
  fontSize?: number;
  /** 仅回收站列表接口会带上 */
  deleted?: boolean;
}
export namespace NNotes {
  export const imgProtocolKey = "base64img";
  /** 正文字号可选范围与步长(px) */
  export const fontSizeMin = 12;
  export const fontSizeMax = 120;
  export const fontSizeStep = 1;
  export const fontSizeDefault = 14;
  /** 把任意字号收敛到合法范围; 空值/非法值回落到默认字号 */
  export function resolveFontSize(fontSize?: number): number {
    if (typeof fontSize !== "number" || !isFinite(fontSize)) {
      return fontSizeDefault;
    }
    return Math.min(
      fontSizeMax,
      Math.max(fontSizeMin, Math.round(fontSize))
    );
  }
}
export default NNotes;
