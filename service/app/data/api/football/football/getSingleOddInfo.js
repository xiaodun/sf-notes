(function () {
  return function (argData, argParams, external) {
    external.getSingleOddInfo(argParams.code, argParams.bet_id, (data) => {
      external.response.end(
        JSON.stringify({
          success: true,
          data,
        })
      );
    });
    return {
      isWrite: false,
      async: true,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
