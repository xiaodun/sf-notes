(function () {
  return function (argData, argParams, external) {
    const path = require("path");
    const file_os = require("fs");
    const exec = require("child_process").exec;
    const sfMockConfig = argData.projectList.find((item) => item.isSfMock);
    const diskName = /(\w+?:)/.exec(sfMockConfig.rootPath)[0];
    const generateFolderPath = path.join(sfMockConfig.rootPath, "generate");
    let commandList = [diskName];

    const cmdFileName = "command.bat";

    commandList.push(`cd ${generateFolderPath}`);
    commandList.push(`node createFileStructure.js`);

    file_os.writeFileSync(cmdFileName, commandList.join("\n"));
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
