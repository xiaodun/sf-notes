(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, projectList: [], inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    let data = {};
    const sfMockProject = argData.projectList.find((item) => item.isSfMock);
    if (sfMockProject) {
      data = {
        success: true,
        data: {
          list: argParams.list.map(
            (url) =>
              `${sfMockProject.sfMock.programUrl}/${argParams.projectName}${url}`
          ),
        },
      };
    } else {
      data.success = false;
      data.message = "请在项目列表中添加sf-mock";
    }
    return {
      response: {
        code: 200,
        data,
      },
    };
  };
})();
