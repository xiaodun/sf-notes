namespace Browser {
  export function isMobile() {
    return "ontouchend" in document.body;
  }
}

export default Browser;
