(function () {
  return function (argData = [], argParams, external) {
    //argData 数据的副本
    argData = external.getBaseStructure(argData);
    const project = argData.projectList.find((item) => item.id == argParams.id);
    project.snippetList = project.snippetList || [];
    external.createSnippetFolder(project.name);
    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data: project,
        },
      },
    };
  };
})();
