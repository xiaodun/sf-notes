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

      const store = external.loadChapterMarkStore();
      const chapterMark = external.getChapterMarkByNovel(store, novelPath, chapter);
      if (!chapterMark || (!Array.isArray(chapterMark.paragraphs) && (!chapterMark.paragraphMarks || typeof chapterMark.paragraphMarks !== "object"))) {
        return { isWrite: false, response: { code: 200, data: { success: false, msg: "当前章节未标记" } } };
      }

      const currentContent = fs.readFileSync(targetFilePath, "utf-8");
      const paragraphs = splitParagraphs(currentContent);
      const marked = Array.isArray(chapterMark.paragraphs) ? chapterMark.paragraphs : [];
      const paragraphMarks = chapterMark.paragraphMarks && typeof chapterMark.paragraphMarks === "object" ? chapterMark.paragraphMarks : {};
      const markedIndexes = [];
      for (const key of Object.keys(paragraphMarks)) {
        const idx = parseInt(key, 10);
        if (!Number.isNaN(idx)) markedIndexes.push(idx);
      }
      for (let i = 0; i < marked.length; i++) {
        if (marked[i] !== undefined && !markedIndexes.includes(i)) markedIndexes.push(i);
      }
      const targets = paragraphIndexes.length > 0 ? paragraphIndexes : markedIndexes;
      const normalizedTargets = [];
      for (const idxRaw of targets) {
        const idx = parseInt(idxRaw, 10);
        if (Number.isNaN(idx) || idx < 0) continue;
        normalizedTargets.push(idx);
      }
      normalizedTargets.sort((a, b) => b - a);
      for (const idx of normalizedTargets) {
        const markedObj = paragraphMarks[String(idx)];
        const markedText = markedObj ? markedObj.text : marked[idx];
        if (markedText === undefined) {
          if (idx >= 0 && idx < paragraphs.length) {
            paragraphs.splice(idx, 1);
          }
          continue;
        }
        paragraphs[idx] = markedText;
      }

      const nextContent = paragraphs.join("\n");
      fs.writeFileSync(targetFilePath, nextContent, "utf-8");

      return {
        isWrite: false,
        response: { code: 200, data: { success: true, data: { content: nextContent, paragraphIndexes: targets } } },
      };
    } catch (error) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "批量段落撤回失败: " + error.message } } };
    }
  };
})();
