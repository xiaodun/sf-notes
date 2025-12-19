(function () {
  const fs = require("fs");
  const path = require("path");
  return function (argData, argParams) {
    const { id, ...updateData } = argParams;
    const data = argData || { authors: [], dynasties: [] };
    // 获取正确的项目根路径
    let projectRoot = __dirname;
    const sfNotesIndex = __dirname.indexOf("sf-notes");
    if (sfNotesIndex !== -1) {
      projectRoot = __dirname.substring(0, sfNotesIndex + "sf-notes".length);
    }
    const filesDir = path.join(projectRoot, "service/app/data/api/classics/classics/files");
    const filePath = path.join(filesDir, `${id}.json`);

    if (!fs.existsSync(filePath)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到对应的名篇",
          },
        },
      };
    }

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      const existing = JSON.parse(fileContent);

      // 防重复：如果修改了标题，检查新标题是否已存在
      if (updateData.title && updateData.title !== existing.title) {
        const files = fs.readdirSync(filesDir);
        for (const file of files) {
          if (file.endsWith(".json") && file !== `${id}.json`) {
            try {
              const otherFilePath = path.join(filesDir, file);
              const otherContent = fs.readFileSync(otherFilePath, "utf8");
              const other = JSON.parse(otherContent);
              if (other.title === updateData.title.trim()) {
                return {
                  isWrite: false,
                  response: {
                    code: 200,
                    data: {
                      success: false,
                      msg: "该标题已存在",
                    },
                  },
                };
              }
            } catch (error) {
              console.error(`Error reading file ${file}:`, error);
            }
          }
        }
      }

      const updated = {
        ...existing,
        ...updateData,
        updateTime: new Date().toISOString(),
      };

      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");

      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
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
            msg: "编辑失败",
          },
        },
      };
    }
  };
})();
