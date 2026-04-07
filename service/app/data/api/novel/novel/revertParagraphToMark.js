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
    const paragraphIndex = parseInt(argParams.paragraphIndex, 10);

    if (!novelPath || !fs.existsSync(novelPath)) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "路径不存在" } } };
    }
    if (!chapter || chapter < 1) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "章节号无效" } } };
    }
    if (Number.isNaN(paragraphIndex) || paragraphIndex < 0) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "段落索引无效" } } };
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

      const paragraphMarks = chapterMark.paragraphMarks && typeof chapterMark.paragraphMarks === "object" ? chapterMark.paragraphMarks : {};
      const markedObj = paragraphMarks[String(paragraphIndex)];
      const markedText = markedObj ? markedObj.text : chapterMark.paragraphs[paragraphIndex];
      const currentContent = fs.readFileSync(targetFilePath, "utf-8");
      const paragraphs = splitParagraphs(currentContent);
      if (markedText === undefined) {
        if (paragraphIndex >= 0 && paragraphIndex < paragraphs.length) {
          paragraphs.splice(paragraphIndex, 1);
        } else {
          return { isWrite: false, response: { code: 200, data: { success: false, msg: "该段未标记" } } };
        }
      } else {
        paragraphs[paragraphIndex] = markedText;
      }
      const nextContent = paragraphs.join("\n");
      fs.writeFileSync(targetFilePath, nextContent, "utf-8");

      return {
        isWrite: false,
        response: { code: 200, data: { success: true, data: { content: nextContent, paragraphIndex } } },
      };
    } catch (error) {
      return { isWrite: false, response: { code: 200, data: { success: false, msg: "段落撤回失败: " + error.message } } };
    }
  };
})();
