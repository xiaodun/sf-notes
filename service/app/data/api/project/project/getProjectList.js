(function () {
  return function (argData, argParams) {
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData,
        },
      },
    };
  };
})();
