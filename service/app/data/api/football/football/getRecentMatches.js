(function () {
  return function (argData, argParams, external) {
    const { startDate, endDate } = argParams;

    external.getRecentMatches(startDate, endDate, (matchData, isMock) => {
      external.response.end(
        JSON.stringify({
          success: true,
          data: {
            list: matchData || [],
            isMock,
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
