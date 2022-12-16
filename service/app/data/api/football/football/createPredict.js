(function () {
  return function (argData, argParams, external) {
    argParams.id = Date.now();
    argData.predictList.push(argParams);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
