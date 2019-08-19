export const FileType = {
  txt: "txt",
  audio: "audio",
  video: "video",
  img: "img"
};
export const StuffixWithType = {
  ".less": FileType.txt,
  ".bat": FileType.txt,
  ".json": FileType.txt,
  ".css": FileType.txt,
  ".js": FileType.txt,
  ".html": FileType.txt,
  ".htm": FileType.txt,
  ".vue": FileType.txt,
  ".java": FileType.txt,
  ".code-snippets": FileType.txt,
  ".png": FileType.img,
  ".jpg": FileType.img,
  ".jpeg": FileType.img,
  ".gif": FileType.img,
  ".mp3": FileType.audio,
  ".mp4": FileType.video,
  ".avi": FileType.video
};
export function getFileType(argName) {
  //根据文件的后缀判断文件的类型
  let index = argName.lastIndexOf(".");
  let stuffix = argName.slice(index);
  return StuffixWithType[stuffix];
}
