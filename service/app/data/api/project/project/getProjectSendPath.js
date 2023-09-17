(function () {
  return function (argData, argParams, external) {
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
