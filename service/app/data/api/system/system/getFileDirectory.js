(function () {
  const fs = require("fs");
  const path = require("path");
  const os = require("os");
  const execSync = require("child_process").execSync;
  return function (argData, argParams) {
    if (argParams.path) {
      const readDir = fs.readdirSync(argParams.path);
      const list = [];
      readDir.forEach((item) => {
        const itemPath = path.join(argParams.path, item);
        const pointPos = item.lastIndexOf(".");
        let stuffix = "";
        if (pointPos !== -1 && pointPos !== 0) {
          stuffix = item.substring(pointPos + 1);
        }
        try {
          const stat = fs.lstatSync(itemPath);
          list.push({
            name: item,
            path: itemPath,
            stuffix,
            isLeaf: !stat.isDirectory(),
          });
        } catch (error) {
          console.log(`${item}操作出错`);
        }
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
    } else {
      const stdout = execSync("wmic logicaldisk get caption").toString();
      const diskList = stdout
        .split("Caption")[1]
        .trim()
        .split("\n")
        .map((item, index) => {
          const name = item.trim();
          return {
            name,
            path: name + "\\",
            isLeaf: false,
            isDisk: true,
          };
        });
      return {
        response: {
          code: 200,
          data: {
            success: true,
            list: diskList,
          },
        },
      };
    }
  };
})();
