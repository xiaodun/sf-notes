(function () {
  const fs = require("fs");
  const path = require("path");
  return function (argData, argParams) {
    const { classic, index = 0 } = argParams;
    const data = argData || { authors: [], dynasties: [] };
    // 获取正确的项目根路径
    let projectRoot = __dirname;
    const sfNotesIndex = __dirname.indexOf("sf-notes");
    if (sfNotesIndex !== -1) {
      projectRoot = __dirname.substring(0, sfNotesIndex + "sf-notes".length);
    }
    const filesDir = path.join(projectRoot, "service/app/data/api/classics/classics/files");

    // 确保目录存在
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }

    // 防重复：按作者+朝代的维度找出已添加的名篇，再结合标题和内容判断是否重复
    try {
      if (fs.existsSync(filesDir)) {
        const files = fs.readdirSync(filesDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            try {
              const filePath = path.join(filesDir, file);
              const fileContent = fs.readFileSync(filePath, "utf8");
              const existing = JSON.parse(fileContent);
              // 检查是否属于同一作者
              if (
                existing.authorId === classic.authorId &&
                existing.title.trim() === classic.title.trim() &&
                existing.content.trim() === classic.content.trim()
              ) {
                return {
                  isWrite: false,
                  response: {
                    code: 200,
                    data: {
                      success: false,
                      msg: "该作者下已存在相同标题和内容的名篇",
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
    } catch (error) {
      console.error("Error checking duplicates:", error);
    }

    const newClassic = {
      ...classic,
      id: Date.now() + "",
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };

    // 保存到单独的文件
    const fileName = `${newClassic.id}.json`;
    const filePath = path.join(filesDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(newClassic, null, 2), "utf8");

    return {
      isWrite: false, // 不需要更新 classics.json
      response: {
        code: 200,
        data: {
          success: true,
          ...newClassic,
        },
      },
    };
  };
})();
