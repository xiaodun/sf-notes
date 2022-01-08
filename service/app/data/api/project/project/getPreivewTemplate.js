(function () {
  return function (argData, argParams, external) {
    //argData 数据的副本
    const project = argData.projectList.find(
      (item) => item.id == argParams.data.id
    );
    const fs = require("fs");
    const snippetScriptPath = external.getSnippetScriptPath(
      project.name,
      argParams.data.script
    );
    const sctiptContent = fs.readFileSync(snippetScriptPath).toString();
    const data = eval(sctiptContent)(argParams.values).ables[
      argParams.data.previewAbleName
    ]();
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
