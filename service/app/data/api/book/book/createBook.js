(function () {
  return function (argData, argParams) {
    argData = argData || [];
    argParams.id = Date.now();
    argParams.createTime = Date.now();
    argParams.prefaceList = [];
    argParams.chapterList = [];
    argParams.epilogList = [];
    argData.push(argParams);
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
