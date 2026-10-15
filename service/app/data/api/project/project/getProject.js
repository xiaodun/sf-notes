(function () {
  return function (argData = [], argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    const project = argData.projectList.find((item) => item.id == argParams.id);
    let isWrite = false;
    if (project && !project.snippetList) {
      project.snippetList = [];
      isWrite = true;
    }
    external.createSnippetFolder(project.name);
    return {
      isWrite,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: project,
        },
      },
    };
  };
})();
