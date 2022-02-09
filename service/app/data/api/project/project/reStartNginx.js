(function () {
  return function (argData, argParams, external) {
    const path = require("path");
    const file_os = require("fs");
    const exec = require("child_process").exec;
    const sfMockConfig = argData.projectList.find((item) => item.isSfMock);
    const diskName = /(\w+?:)/.exec(sfMockConfig.rootPath)[0];
    const generateFolderPath = path.join(sfMockConfig.rootPath, "generate");
    const nginxFolderPath = path.join(sfMockConfig.rootPath, "nginx-1.19.6");
    let commandList = [diskName];

    const cmdFileName = "command.bat";

    commandList.push(`taskkill /f /t /im nginx.exe`);
    commandList.push(`cd ${generateFolderPath}`);
    commandList.push(`node writeNginxConfig.js`);
    commandList.push(`cd ${nginxFolderPath}`);
    commandList.push(`start nginx.exe`);

    file_os.writeFileSync(cmdFileName, commandList.join("\n"));
    //运行nginx的原因,回调不触发
    exec(cmdFileName, function (err, stdout, stderr) {
      if (err) {
        console.error(err);
      }
    });

    setTimeout(() => {
      file_os.unlinkSync(cmdFileName);
    }, 1000);
    return {
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
