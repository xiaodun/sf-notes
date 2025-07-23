(function () {
  return function (argData, argParams, external) {
    const { matchIds } = argParams;

    external.getMatchOddsDetail(matchIds, (oddsData, isMock) => {
      external.response.end(
        JSON.stringify({
          success: true,
          data: {
            ...oddsData,
            isMock: isMock || false,
          },
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
