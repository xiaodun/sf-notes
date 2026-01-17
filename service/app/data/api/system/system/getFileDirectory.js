(function () {
  const fs = require("fs");
  const path = require("path");
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
      // 使用 fs 模块获取磁盘列表，兼容性更好
      let diskList = [];
      try {
        // 尝试使用 wmic（旧版 Windows）
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
          // wmic 失败，尝试使用 PowerShell
          try {
            const stdout = execSync('powershell -Command "Get-WmiObject -Class Win32_LogicalDisk | Select-Object -ExpandProperty DeviceID"', { encoding: 'utf8', timeout: 5000 });
            diskList = stdout
              .split('\n')
              .map((item) => item.trim())
              .filter((item) => item && item.length > 0);
          } catch (psError) {
            // PowerShell 也失败，使用默认磁盘列表（Windows 常见磁盘）
            diskList = ['C:', 'D:', 'E:', 'F:'];
          }
        }
        
        const formattedDiskList = diskList.map((name) => ({
          name,
          path: name + "\\",
          isLeaf: false,
          isDisk: true,
        }));
        
        return {
          response: {
            code: 200,
            data: {
              success: true,
              list: formattedDiskList,
            },
          },
        };
      } catch (error) {
        // 如果所有方法都失败，返回默认磁盘列表
        console.error('返回默认磁盘列表');
        const defaultDiskList = ['C:', 'D:', 'E:', 'F:'].map((name) => ({
          name,
          path: name + "\\",
          isLeaf: false,
          isDisk: true,
        }));
        
        return {
          response: {
            code: 200,
            data: {
              success: true,
              list: defaultDiskList,
            },
          },
        };
      }
    }
  };
})();
