const fs = require("fs");
const path = require("path");

(function () {
  function getAllChapterFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      return [];
    }
    entries.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(getAllChapterFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".txt")) {
        results.push(fullPath);
      }
    }
    return results;
  }

  function splitParagraphs(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
  }

  return function (argData, argParams, external) {
    const novelPath = argParams.path;
    const chapter = parseInt(argParams.chapter, 10);
    const paragraphIndexes = Array.isArray(argParams.paragraphIndexes) ? argParams.paragraphIndexes : [];

    if (!novelPath || !fs.existsSync(novelPath)) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "路径不存在" } } };
    }
    if (!chapter || chapter < 1) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "章节号无效" } } };
    }

    try {
      const files = getAllChapterFiles(novelPath);
      const targetFilePath = files[chapter - 1];
      if (!targetFilePath || !fs.existsSync(targetFilePath)) {
        return { isWrite: false, response: { code: 200, data: { success: false, msg: "章节文件不存在" } } };
      }

      const content = fs.readFileSync(targetFilePath, "utf-8");
      const lines = splitParagraphs(content);
      const store = external.loadChapterMarkStore();

      const chapterMark = external.getChapterMarkByNovel(store, novelPath, chapter) || {
        chapter,
        markedAt: new Date().toISOString(),
        rawLines: [],
        paragraphMarks: {},
        paragraphs: [],
      };
      if (!Array.isArray(chapterMark.rawLines)) chapterMark.rawLines = [];
      if (!chapterMark.paragraphMarks || typeof chapterMark.paragraphMarks !== "object") chapterMark.paragraphMarks = {};
      if (!Array.isArray(chapterMark.paragraphs)) chapterMark.paragraphs = [];
      chapterMark.rawLines = lines.map((text, idx) => ({ lineNo: idx + 1, text }));
      const targets = paragraphIndexes.length > 0 ? paragraphIndexes : lines.map((_, idx) => idx);
      for (const idxRaw of targets) {
        const idx = parseInt(idxRaw, 10);
        if (Number.isNaN(idx) || idx < 0) continue;
        const lineText = lines[idx] !== undefined ? lines[idx] : "";
        chapterMark.paragraphMarks[String(idx)] = { lineNo: idx + 1, text: lineText };
        chapterMark.paragraphs[idx] = lineText;
      }
      chapterMark.markedAt = new Date().toISOString();
      external.setChapterMarkByNovel(store, novelPath, chapter, chapterMark);
      external.saveChapterMarkStore(store);

      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: true, data: { markedAt: chapterMark.markedAt, paragraphIndexes: targets } },
        },
      };
    } catch (error) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "批量段落标记失败: " + error.message } } };
    }
  };
})();
