(function () {
  const fs = require("fs");
  const path = require("path");
  return function (argData, argParams) {
    const readDir = fs.readdirSync(argParams.path);
    const list = readDir.map((item) => {
      const itemPath = path.join(argParams.path, item);
      const pointPos = item.lastIndexOf(".");
      let stuffix = "";
      if (pointPos !== -1 && pointPos !== 0) {
        stuffix = item.substring(pointPos + 1);
      }
      const stat = fs.lstatSync(itemPath);
      return {
        name: item,
        path: itemPath,
        stuffix,
        isLeaf: !stat.isDirectory(),
      };
    });
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list,
        },
      },
    };
  };
})();
