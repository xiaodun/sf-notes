(function () {
  const fs = require("fs");
  const path = require("path");
  return function (argData, argParams) {
    function getDiskList() {
      const diskList = [];
      for (let i = 65; i <= 90; i++) {
        const drive = String.fromCharCode(i) + ':\\';
        try {
          fs.readdirSync(drive);
          diskList.push(String.fromCharCode(i) + ':');
        } catch (e) {}
      }
      return diskList.map((name) => ({
        name,
        path: name + "\\",
        isLeaf: false,
        isDisk: true,
      }));
    }
    if (argParams.path) {
      const normalizePath = String(argParams.path).replace(/\//g, "\\");
      let entries = [];
      try {
        entries = fs.readdirSync(normalizePath, { withFileTypes: true });
      } catch (error) {
        return {
          response: {
            code: 200,
            data: {
              success: true,
              list: getDiskList(),
              message: "路径不存在，已回退到磁盘根目录",
            },
          },
        };
      }
      const list = [];
      entries.forEach((entry) => {
        try {
          const pointPos = entry.name.lastIndexOf(".");
          const stuffix = pointPos > 0 ? entry.name.substring(pointPos + 1) : "";
          list.push({
            name: entry.name,
            path: path.join(normalizePath, entry.name),
            stuffix,
            isLeaf: !entry.isDirectory(),
          });
        } catch (error) {
          console.log(`${entry.name}操作出错`);
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
      return {
        response: {
          code: 200,
          data: {
            success: true,
            list: getDiskList(),
          },
        },
      };
    }
  };
})();
