(function () {
  return function (argData, argParams, external) {
    argData.systemConfig.list.forEach((systemTagConfig) => {
      systemTagConfig.address = {};
      if (systemTagConfig.url && systemTagConfig.moreEnv) {
        argData.envConfig.list.forEach((envConfig) => {
          external.getEnvUrl(systemTagConfig, envConfig.value);
        });
      }
    });
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.systemConfig.list,
        },
      },
    };
  };
})();
