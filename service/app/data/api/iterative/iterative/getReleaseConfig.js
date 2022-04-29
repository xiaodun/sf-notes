(function () {
  return function (argData, argParams) {
    return {
      response: {
        code: 200,
        data: {
          success: true,
          data: argData.releaseConfig,
        },
      },
    };
  };
})();
