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
      function getAllFiles(dir) {
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
            results = results.concat(getAllFiles(fullPath));
          } else if (entry.isFile() && entry.name.endsWith(".txt")) {
            results.push(fullPath);
          }
        }

        return results;
      }

      const files = getAllFiles(novelPath);
      const totalWordCount = files.reduce((sum, filePath) => {
        const text = fs.readFileSync(filePath, "utf-8");
        return sum + text.replace(/\s/g, "").length;
      }, 0);

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: {
              totalWordCount,
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
            msg: "统计总字数失败: " + error.message,
          },
        },
      };
    }
  };
})();
