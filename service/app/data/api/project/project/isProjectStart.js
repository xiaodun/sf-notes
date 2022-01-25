(function () {
  return function (argData, argParams, external) {
    const request = require("request");
    let isStart = true;
    let isError = false;

    request(argParams.url, function (error, response, body) {
      if (error) {
        isStart = false;
        isError = true;
      }
      external.response.end(
        JSON.stringify({
          success: true,

          data: {
            isStart,
            isError,
          },
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
