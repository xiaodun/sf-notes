(function () {
  const fs = require("fs");
  const path = require("path");
  const execSync = require("child_process").execSync;
  return function (argData, argParams) {
    function getDiskList() {
      let diskList = [];
      try {
        try {
          const stdout = execSync("wmic logicaldisk get caption", { encoding: 'utf8', timeout: 5000 });
          diskList = stdout
            .split("Caption")[1]
            .trim()
            .split("\n")
            .map((item) => {
              const name = item.trim();
              return name;
            })
            .filter((name) => name && name.length > 0);
        } catch (wmicError) {
          try {
            const stdout = execSync('powershell -Command "Get-WmiObject -Class Win32_LogicalDisk | Select-Object -ExpandProperty DeviceID"', { encoding: 'utf8', timeout: 5000 });
            diskList = stdout
              .split('\n')
              .map((item) => item.trim())
              .filter((item) => item && item.length > 0);
          } catch (psError) {
            diskList = ['C:', 'D:', 'E:', 'F:'];
          }
        }
      } catch (error) {
        diskList = ['C:', 'D:', 'E:', 'F:'];
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
      let readDir = [];
      try {
        readDir = fs.readdirSync(normalizePath);
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
      readDir.forEach((item) => {
        const itemPath = path.join(normalizePath, item);
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
