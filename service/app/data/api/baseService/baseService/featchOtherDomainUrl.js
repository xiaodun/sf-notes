(function () {
  return function (argData, argParams) {
    const request = require("sync-request");
    let data;

    try {
      const rsp = request("get", argParams.url);
      data = {
        success: true,
        data: {
          data: JSON.parse(rsp.getBody("utf8")),
        },
      };
    } catch (error) {
      data = {
        success: false,
        message: error.message,
      };
    }
    return {
      isWrite: false,

      response: {
        code: 200,
        data,
      },
    };
  };
})();
