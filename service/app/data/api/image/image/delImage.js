(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = require("path");
    const id = argParams.id;
    let file;
    const index = (argData || []).findIndex((item) => {
      if (String(item.id) === String(id)) {
        file = item;
        return true;
      }
    });
    if (index === -1) {
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
    if (file && file.flag) {
      const filePath = path.join("./data/api/image/image/", file.flag);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const newData = argData.filter(
      (item) => String(item.id) !== String(id)
    );
    return {
      isWrite: true,
      data: newData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
