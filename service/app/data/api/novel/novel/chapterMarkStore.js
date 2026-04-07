const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join("./mark", "chapter_marks.json");

function loadJsonSafe(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) return fallbackValue;
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    return fallbackValue;
  }
}

function saveJson(filePath, data) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function loadStore() {
  return loadJsonSafe(STORE_PATH, {});
}

function saveStore(store) {
  saveJson(STORE_PATH, store || {});
}

function getNovelMarks(store, novelPath) {
  const key = String(novelPath || "");
  if (!store[key] || typeof store[key] !== "object") {
    store[key] = {};
  }
  return store[key];
}

function getChapterMark(store, novelPath, chapter) {
  const novelMarks = getNovelMarks(store, novelPath);
  return novelMarks[String(chapter)];
}

function setChapterMark(store, novelPath, chapter, chapterMark) {
  const novelMarks = getNovelMarks(store, novelPath);
  novelMarks[String(chapter)] = chapterMark;
}

function deleteChapterMark(store, novelPath, chapter) {
  const novelMarks = getNovelMarks(store, novelPath);
  const key = String(chapter);
  const existed = Object.prototype.hasOwnProperty.call(novelMarks, key);
  delete novelMarks[key];
  return existed;
}

module.exports = {
  loadStore,
  saveStore,
  getChapterMark,
  setChapterMark,
  deleteChapterMark,
};
