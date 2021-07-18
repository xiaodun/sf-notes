export namespace USelection {
  export function end(dom: HTMLTextAreaElement | HTMLInputElement) {
    dom.focus();
    const val = dom.value;
    dom.value = "";
    dom.value = val;
  }
  export function getCursorPos() {
    // @ts-ignore
    return document.activeElement.selectionStart || 0;
  }
}
