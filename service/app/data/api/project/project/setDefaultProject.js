(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    argData.projectList.forEach((item) => {
      if (item.id === argParams.id) {
        item.isDefault = true;
      } else {
        item.isDefault = false;
      }
    });

    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
