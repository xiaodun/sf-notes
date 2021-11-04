(function () {
  return function (argData, argParams) {
    const request = require("sync-request");

    const rsp = request("get", argParams.url);
    let data = JSON.parse(rsp.getBody("utf8"));
    return {
      isWrite: false,

      response: {
        code: 200,
        data: {
          success: true,
          data,
        },
      },
    };
  };
})();
