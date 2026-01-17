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
      const files = fs.readdirSync(novelPath);
      const chapterList = [];
      
      // 读取所有 .txt 文件，提取章节号
      files.forEach((file) => {
        if (file.endsWith(".txt")) {
          // 匹配文件名格式：数字.txt
          const match = file.match(/^(\d+)\.txt$/);
          if (match) {
            const chapter = parseInt(match[1]);
            const filePath = path.join(novelPath, file);
            chapterList.push({
              chapter: chapter,
              exists: fs.existsSync(filePath),
            });
          }
        }
      });

      // 按章节号排序
      chapterList.sort((a, b) => a.chapter - b.chapter);

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

