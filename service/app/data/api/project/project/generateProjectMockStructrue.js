(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
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
