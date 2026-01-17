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
      const filePath = path.join(novelPath, `${chapter}.txt`);
      
      if (!fs.existsSync(filePath)) {
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
      const content = fs.readFileSync(filePath, "utf-8");

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

