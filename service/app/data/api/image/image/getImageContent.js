(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const id = String(argParams.id || "").trim();
    const list = Array.isArray(argData) ? argData : [];
    const item = list.find((it) => String(it.id) === id);
    
    // 检查项目是否存在
    if (!item) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "图片不存在",
          },
        },
      };
    }

    // 使用 item.flag 作为文件名
    const fileName = item.flag;

    // 直接在当前目录下查找图片文件
    const absPath = path.join("./data/api/image/image/", fileName);
    const content = fs.readFileSync(absPath).toString("base64");

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            content,
            mimeType:item.mimeType
          },
        },
      },
    };
  };
})();
