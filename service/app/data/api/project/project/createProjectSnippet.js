(function () {
  return function (argData, argParams, external) {
    const project = argData.projectList.find((item) => item.id == argParams.id);
    const fs = require("fs");
    let success = true,
      message = "";
    if (project.snippetList.find((item) => item.name === argParams.name)) {
      success = false;
      message = "片段名重复";
    }

    if (project.snippetList.find((item) => item.script === argParams.script)) {
      success = false;
      message = "脚本文件名重复";
    }

    if (success) {
      const snippetScriptPath = external.getSnippetScriptPath(
        project.name,
        argParams.script
      );
      project.snippetList.push({
        name: argParams.name,
        script: argParams.script,
      });
      fs.writeFileSync(
        snippetScriptPath,
        `
        
            (function(){

                

            })()
        
        `
      );
    }

    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success,
          message,
        },
      },
    };
  };
})();
