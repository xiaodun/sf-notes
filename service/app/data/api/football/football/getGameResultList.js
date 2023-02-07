(function () {
  return function (argData, argParams, external) {
    external.getGameResultList(
      argParams.matchBeginDate,
      argParams.matchEndDate,
      argParams.codeList,
      (data) => {
        external.response.end(
          JSON.stringify({
            success: true,
            data,
          })
        );
      }
    );
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
