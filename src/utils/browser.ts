namespace Browser {
  export function isMobile() {
    if (typeof document === "undefined" || document.body == null) {
      return false;
    }
    return "ontouchend" in document.body;
  }

  /** 是否 Windows 平台 */
  export function isWindows(): boolean {
    if (typeof navigator === "undefined") return false;
    return /Win/.test(navigator.platform || "");
  }

  /** 路径分隔符 */
  export function pathSep(): string {
    return isWindows() ? "\\" : "/";
  }
}

export default Browser;
