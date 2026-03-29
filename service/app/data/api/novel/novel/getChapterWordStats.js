const fs = require("fs");
const path = require("path");

(function () {
  return function (argData, argParams) {
    const novelPath = argParams.path;

    if (!novelPath || !fs.existsSync(novelPath)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "路径不存在",
          },
        },
      };
    }

    try {
      function countTextLength(text) {
        if (!text) return 0;
        return text.replace(/\s/g, "").length;
      }

      function getAllFiles(dir, parentName = "") {
        let results = [];
        if (!fs.existsSync(dir)) return results;

        let entries;
        try {
          entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (e) {
          return [];
        }

        entries.sort((a, b) => {
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" });
        });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            const dirName = entry.name.replace(/\D/g, "");
            const newParentName = parentName ? `${parentName}-${dirName}` : dirName;
            results = results.concat(getAllFiles(fullPath, newParentName));
          } else if (entry.isFile() && entry.name.endsWith(".txt")) {
            const fileName = entry.name.replace(".txt", "");
            const name = parentName ? `${parentName}-${fileName}` : fileName;
            results.push({ path: fullPath, name });
          }
        }

        return results;
      }

      const files = getAllFiles(novelPath);
      const chapterWordStats = files.map((item, index) => {
        const text = fs.readFileSync(item.path, "utf-8");
        return {
          chapter: index + 1,
          name: item.name,
          wordCount: countTextLength(text),
        };
      });

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: {
              chapterWordStats,
            },
          },
        },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "统计章节字数失败: " + error.message,
          },
        },
      };
    }
  };
})();
