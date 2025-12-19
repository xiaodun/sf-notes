(function () {
  const fs = require("fs");
  const path = require("path");
  return function (argData, argParams) {
    const { authorId, dynastyId, page = 1, pageSize = 20 } = argParams || {};
    const data = argData || { authors: [], dynasties: [] };
    
    // 从文件目录读取所有名篇文件
    // 获取正确的项目根路径
    let projectRoot = __dirname;
    const sfNotesIndex = __dirname.indexOf("sf-notes");
    if (sfNotesIndex !== -1) {
      projectRoot = __dirname.substring(0, sfNotesIndex + "sf-notes".length);
    }
    const filesDir = path.join(projectRoot, "service/app/data/api/classics/classics/files");
    let allClassics = [];
    console.log(filesDir);
    try {
      if (fs.existsSync(filesDir)) {
        const files = fs.readdirSync(filesDir);
        files.forEach((file) => {
          if (file.endsWith(".json")) {
            try {
              const filePath = path.join(filesDir, file);
              const fileContent = fs.readFileSync(filePath, "utf8");
              const classic = JSON.parse(fileContent);
              allClassics.push(classic);
            } catch (error) {
              console.error(`Error reading file ${file}:`, error);
            }
          }
        });
      }
    } catch (error) {
      console.error("Error reading classics files:", error);
    }

    // 按作者搜索
    if (authorId) {
      allClassics = allClassics.filter((item) => item.authorId === authorId);
    }

    // 按朝代搜索（需要通过作者查找）
    if (dynastyId) {
      // 确保从 argData 中读取 authors，如果没有则从 classics.json 读取
      let authorsList = data.authors || [];
      if (!authorsList || authorsList.length === 0) {
        // 如果 argData 中没有 authors，尝试从 classics.json 读取
        try {
          const classicsJsonPath = path.join(projectRoot, "service/app/data/api/classics/classics/classics.json");
          if (fs.existsSync(classicsJsonPath)) {
            const classicsJsonContent = fs.readFileSync(classicsJsonPath, "utf8");
            const classicsJsonData = JSON.parse(classicsJsonContent);
            authorsList = classicsJsonData.authors || [];
          }
        } catch (error) {
          console.error("Error reading classics.json:", error);
        }
      }
      const authorIds = authorsList
        .filter((author) => author.dynastyId === dynastyId)
        .map((author) => author.id);
      allClassics = allClassics.filter((item) => authorIds.includes(item.authorId));
    }

    // 按创建时间倒序排序（最新的在前）
    allClassics.sort((a, b) => (b.createTime || 0) - (a.createTime || 0));

    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const list = allClassics.slice(startIndex, endIndex);

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: list,
        },
      },
    };
  };
})();
