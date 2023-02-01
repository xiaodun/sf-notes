(function () {
  return function (argData, argParams, external) {
    external.getNoStartGameList((list) => {
      external.response.end(
        JSON.stringify({
          success: true,
          list,
        })
      );
    });
    return {
      isWrite: false,
      async: true,
      response: {
        code: 200,
      },
    };
  };
})();
