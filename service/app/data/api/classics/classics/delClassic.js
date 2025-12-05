(function () {
  const fs = require("fs");
  const path = require("path");
  return function (argData, argParams) {
    const { id } = argParams;
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
      // 直接删除文件
      fs.unlinkSync(filePath);

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
            msg: "删除失败",
          },
        },
      };
    }
  };
})();
