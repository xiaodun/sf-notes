(function () {
  return function (argData, argParams) {
    const child_process = require("child_process");
    child_process.execFileSync(argParams.path);
    return {
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
