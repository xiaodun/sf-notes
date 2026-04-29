(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    external.createCopySwaggerJs();
    const data = eval(
      fs.readFileSync(external.getCopySwaggerJsPath()).toString()
    )(argParams);
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
