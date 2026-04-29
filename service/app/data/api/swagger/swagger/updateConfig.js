(function () {
  return function (argData, argParams, external) {
    Object.keys(argParams.config).forEach((key) => {
      argData.config[key] = argParams.config[key];
    });
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          data: argData.config,
        },
      },
    };
  };
})();
