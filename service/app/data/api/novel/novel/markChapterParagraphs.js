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

  function countTextLength(text) {
    return String(text || "").replace(/\s/g, "").length;
  }

  function splitParagraphs(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .split("\n");
  }

  return function (argData, argParams, external) {
    const novelPath = argParams.path;
    const chapter = parseInt(argParams.chapter, 10);

    if (!novelPath || !fs.existsSync(novelPath)) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "路径不存在" } },
      };
    }

    if (!chapter || chapter < 1) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "章节号无效" } },
      };
    }

    try {
      const files = getAllChapterFiles(novelPath);
      const targetFilePath = files[chapter - 1];
      if (!targetFilePath || !fs.existsSync(targetFilePath)) {
        return {
          isWrite: false,
          response: { code: 200, data: { success: false, msg: "章节文件不存在" } },
        };
      }

      const content = fs.readFileSync(targetFilePath, "utf-8");
      const lines = splitParagraphs(content);
      const markedAt = new Date().toISOString();
      const rawLines = lines.map((text, idx) => ({ lineNo: idx + 1, text }));
      const paragraphMarks = {};
      for (let i = 0; i < lines.length; i++) {
        paragraphMarks[String(i)] = { lineNo: i + 1, text: lines[i] };
      }

      const chapterMark = {
        chapter,
        markedAt,
        totalWordCount: countTextLength(content),
        rawLines,
        paragraphMarks,
        paragraphs: lines,
      };

      const store = external.loadChapterMarkStore();
      external.setChapterMarkByNovel(store, novelPath, chapter, chapterMark);
      external.saveChapterMarkStore(store);

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: { markedAt, paragraphCount: lines.length },
          },
        },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "标记失败: " + error.message } },
      };
    }
  };
})();
