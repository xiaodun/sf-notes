(function () {
  return function (argData, argParams, external) {
    const project = argData.projectList.find(
      (item) => item.id == argParams.data.id
    );
    const fs = require("fs");
    const snippetScriptPath = external.getSnippetScriptPath(
      project.name,
      argParams.data.script
    );
    const sctiptContent = fs.readFileSync(snippetScriptPath).toString();
    const data = eval(sctiptContent)(argParams.values, project).fragmentList[
      argParams.data.index
    ].getTemplate();
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data,
        },
      },
    };
  };
})();
