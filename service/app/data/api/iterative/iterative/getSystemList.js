(function () {
  return function (argData, argParams, external) {
    argData.systemConfig.list.forEach((systemTagConfig) => {
      systemTagConfig.address = {};
      if (systemTagConfig.url && systemTagConfig.isMoreEnv) {
        argData.envConfig.list.forEach((env) => {
          external.getEnvUrl(systemTagConfig, env.branch);
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
