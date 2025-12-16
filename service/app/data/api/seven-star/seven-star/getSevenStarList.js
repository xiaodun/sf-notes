(function () {
  return function (argData, argParams, external) {
    return {
      response: {
        code: 200,
        data: {
          success: true,
          data: argData.sevenStarList || [],
        },
      },
    };
  };
})();

