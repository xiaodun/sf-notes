(function () {
  return function (argData, argParams) {
    const { id } = argParams;
    const data = argData || { authors: [], dynasties: [], classics: [] };
    data.authors = data.authors || [];
    const index = data.authors.findIndex((item) => item.id === id);

    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到对应的作者",
          },
        },
      };
    }

    // 检查是否有名篇使用该作者
    // 获取正确的项目根路径
    const fs = require("fs");
    const path = require("path");
    let projectRoot = __dirname;
    const sfNotesIndex = __dirname.indexOf("sf-notes");
    if (sfNotesIndex !== -1) {
      projectRoot = __dirname.substring(0, sfNotesIndex + "sf-notes".length);
    }
    const filesDir = path.join(projectRoot, "service/app/data/api/classics/classics/files");
    let hasClassics = false;
    try {
      if (fs.existsSync(filesDir)) {
        const files = fs.readdirSync(filesDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const filePath = path.join(filesDir, file);
              const fileContent = fs.readFileSync(filePath, "utf8");
              const classic = JSON.parse(fileContent);
              if (classic.authorId === id) {
                hasClassics = true;
                break;
              }
            } catch (error) {
              console.error(`Error reading file ${file}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error checking classics:", error);
    }
    if (hasClassics) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "该作者下有名篇，无法删除",
          },
        },
      };
    }

    // 真删除：从数组中移除
    data.authors.splice(index, 1);

    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();

