(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    let delIndex = argParams.oldIndex;
    let addIndex = argParams.newIndex;
    if (argParams.oldIndex > argParams.newIndex) {
      delIndex++;
    } else {
      addIndex++;
    }
    argData.projectList.splice(
      addIndex,
      0,
      argData.projectList[argParams.oldIndex]
    );

    argData.projectList.splice(delIndex, 1);

    return {
      isWrite: true,
      data: argData,
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
