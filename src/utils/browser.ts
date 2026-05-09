namespace Browser {
  export function isMobile() {
    if (typeof document === "undefined" || document.body == null) {
      return false;
    }
    return "ontouchend" in document.body;
  }
}

export default Browser;
