(function () {
  return function (argData, argParams) {
    const request = require("sync-request");

    const imgRsp = request("get", argParams.url);
    let bytes = new Uint8Array(imgRsp.getBody());
    const data = Buffer.from(bytes, "utf8").toString("base64");
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: data,
        },
      },
    };
  };
})();
