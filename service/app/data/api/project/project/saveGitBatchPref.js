(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    argData.gitBatchPref = {
      lastAction: argParams.lastAction || 'pull',
      lastSelectedProjectIds: argParams.lastSelectedProjectIds || [],
    };
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: { success: true },
      },
    };
  };
})();
