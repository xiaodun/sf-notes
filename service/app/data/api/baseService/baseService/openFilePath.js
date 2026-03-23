(function () {
  return function (argData, argParams) {
    const file_os = require("fs");
    const path = require("path");
    const { exec } = require("child_process");
    const filePath = String(argParams.filePath || "").trim();
    const absPath = path.resolve(filePath);
    if (!filePath || !file_os.existsSync(absPath)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "路径不存在",
          },
        },
      };
    }
    const escapeSingle = (value) => String(value).replace(/'/g, "''");
    const psPath = escapeSingle(absPath);
    const psCommand = `$p='${psPath}'; Start-Process explorer.exe -ArgumentList $p; Start-Sleep -Milliseconds 300; $ws=New-Object -ComObject WScript.Shell; if(-not $ws.AppActivate('文件资源管理器')){ $ws.AppActivate('File Explorer') | Out-Null }`;
    exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`);
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
