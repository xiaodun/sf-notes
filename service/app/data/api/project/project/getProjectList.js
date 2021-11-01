(function () {
  return function (argData, argParams, external) {
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

    argData = external.getBaseStructure(argData);
    argData.projectList.forEach((item) => {
      item.sfMock.openUrl = item.sfMock.nginxPort
        ? `http://${ip}:${item.sfMock.nginxPort}${item.sfMock.addressPath}`
        : `${item.sfMock.programUrl}${item.sfMock.addressPath}`;
    });
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.projectList,
        },
      },
    };
  };
})();
