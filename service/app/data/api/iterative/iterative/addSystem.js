(function () {
  return function (argData, argParams) {
    argParams.id = Date.now();
    argData.systemConfig.list.push(argParams);
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
