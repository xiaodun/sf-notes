(function () {
  const fs = require("fs");
  const path = require("path");
  const os = require("os");
  return function (argData, argParams) {
    const platform = os.platform();

    function getDiskList() {
      if (platform === "darwin") {
        // macOS: list root directory and common locations
        const roots = [
          { name: "/", path: "/", isDisk: true },
        ];
        try {
          const homeDir = os.homedir();
          if (homeDir && homeDir !== "/") {
            roots.push({ name: "~", path: homeDir, isDisk: true });
          }
        } catch (_) {}
        return roots.map((r) => ({ ...r, isLeaf: false }));
      }
      // Windows: list drive letters
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
      let normalizePath = String(argParams.path);
      if (platform !== "darwin") {
        normalizePath = normalizePath.replace(/\//g, "\\");
      }
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
              message: platform === "darwin"
                ? "路径不存在，已回退到根目录"
                : "路径不存在，已回退到磁盘根目录",
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
