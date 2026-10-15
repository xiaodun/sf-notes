(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    Object.keys(argParams.config).forEach((key) => {
      argData.config[key] = argParams.config[key];
    });
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          data: argData.config,
        },
      },
    };
  };
})();
