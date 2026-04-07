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

  return function (argData, argParams) {
    const novelPath = argParams.path;
    const chapter = parseInt(argParams.chapter, 10);
    const content = typeof argParams.content === "string" ? argParams.content : "";

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

      fs.writeFileSync(targetFilePath, content, "utf-8");

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: { filePath: targetFilePath },
          },
        },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "写入失败: " + error.message } },
      };
    }
  };
})();
