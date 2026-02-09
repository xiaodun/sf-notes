const fs = require("fs");
const path = require("path");

(function () {
  return function (argData, argParams) {
    const novelPath = argParams.path;
    const chapter = parseInt(argParams.chapter);
    
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

    if (!chapter || chapter < 1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "章节号无效",
          },
        },
      };
    }

    try {
      // 递归获取所有符合条件的章节文件（保持顺序），逻辑需与 getChapterList 保持一致
      function getAllFiles(dir) {
        let results = [];
        if (!fs.existsSync(dir)) return results;
        
        let entries;
        try {
           entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (e) {
           return [];
        }

        // 按名称排序（数字优先）
        entries.sort((a, b) => {
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(getAllFiles(fullPath));
          } else if (entry.isFile() && entry.name.endsWith(".txt")) {
             // 仅匹配数字命名的txt文件
             if (/^(\d+)\.txt$/.test(entry.name)) {
                results.push(fullPath);
             }
          }
        }
        return results;
      }

      const files = getAllFiles(novelPath);
      // 章节号从1开始，所以索引是 chapter - 1
      const targetIndex = chapter - 1;
      const targetFilePath = files[targetIndex];
      
      if (!targetFilePath || !fs.existsSync(targetFilePath)) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              msg: "章节文件不存在",
            },
          },
        };
      }

      // 读取文件内容
      const content = fs.readFileSync(targetFilePath, "utf-8");

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: content,
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
            msg: "读取文件失败: " + error.message,
          },
        },
      };
    }
  };
})();

