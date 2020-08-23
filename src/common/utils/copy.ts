export namespace UCopy {
  export function copy(text: string) {
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
    });
  }
}

export default UCopy;
