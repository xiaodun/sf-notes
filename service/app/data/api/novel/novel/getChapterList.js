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
      // 递归获取所有符合条件的章节文件（保持顺序）
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
      
      // 按顺序生成章节列表，章节号累加
      const chapterList = files.map((file, index) => ({
        chapter: index + 1,
        exists: true
      }));

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: chapterList,
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
            msg: "读取目录失败: " + error.message,
          },
        },
      };
    }
  };
})();

