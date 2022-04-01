(function () {
  return function (argData = [], argParams, external) {
    argData = external.getBaseStructure(argData);
    const project = argData.projectList.find((item) => item.id == argParams.id);
    project.snippetList = project.snippetList || [];
    external.createSnippetFolder(project.name);
    return {
      isWrite: true,
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
