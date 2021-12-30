(function () {
  return function (argData, argParams, external) {
    argData = external.getBaseStructure(argData);
    argData.projectList.forEach((project) => {
      delete project.isDefaultAjaxCode;
      if (project.name === argParams.projectName) {
        project.isDefaultAjaxCode = true;
      }
    });
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
