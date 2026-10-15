(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
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
