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
      function getAllFiles(dir, parentName = "") {
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
            const dirName = entry.name.replace(/\D/g, ""); // 只保留数字部分
            // 如果提取后为空，且原名不为空，为了避免空字符串导致的连字符问题，可能需要处理？
            // 用户要求只保留数字，假设目录名中一定包含数字或者就是为了过滤掉非数字目录
            const newParentName = parentName ? `${parentName}-${dirName}` : dirName;
            results = results.concat(getAllFiles(fullPath, newParentName));
          } else if (entry.isFile() && entry.name.endsWith(".txt")) {
             // 匹配 DDN-Index.txt 或纯数字.txt
             // 之前的逻辑只匹配纯数字: /^(\d+)\.txt$/
             // 现在的逻辑需要兼容两种格式
             if (/^(\d+)(?:-(\d+))?\.txt$/.test(entry.name)) {
                const fileName = entry.name.replace(".txt", "");
                const displayName = parentName ? `${parentName}-${fileName}` : fileName;
                results.push({ path: fullPath, name: displayName });
             }
          }
        }
        return results;
      }

      const files = getAllFiles(novelPath);
      
      // 按顺序生成章节列表，章节号累加
      const chapterList = files.map((item, index) => ({
        chapter: index + 1,
        name: item.name,
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

