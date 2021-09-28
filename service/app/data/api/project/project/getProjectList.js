(function () {
  return function (argData, argParams, external) {
    argData = external.getBaseStructure(argData);
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.projectList,
        },
      },
    };
  };
})();
