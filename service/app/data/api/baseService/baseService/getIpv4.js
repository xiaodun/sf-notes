(function () {
  return function (argData, argParams, external) {
    const os = require("os");
    let ip = "";
    let network = os.networkInterfaces();
    for (let key in network) {
      let env = network[key];
      for (var i = 0; i < env.length; i++) {
        if (env[i].family == "IPv4" && env[i].address != "127.0.0.1") {
          ip = env[i].address;
        }
      }
    }
    return {
      isWrite: false,
      //data:argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: ip,
        },
      },
    };
  };
})();
