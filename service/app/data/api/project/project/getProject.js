(function () {
  return function (argData = [], argParams, external) {
    const project = argData.projectList.find((item) => item.id == argParams.id);
    let isWrite = false;
    if (!project.snippetList) {
      project.snippetList = [];
      isWrite = true;
    }
    external.createSnippetFolder(project.name);
    return {
      isWrite: isWrite,
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
