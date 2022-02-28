(function () {
  return function (argData, argParams) {
    const file_os = require("fs");
    const exec = require("child_process").exec;

    const cmdFileName = "command.bat";
    const commandList = [];
    commandList.push(`code -r ${argParams.filePath}`);
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
