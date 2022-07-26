(function () {
  return function (argData, argParams, external) {
    let result = {};
    const sfMockProject = argData.projectList.find((item) => item.isSfMock);
    if (sfMockProject) {
      result.list = argParams.list.map(
        (url) =>
          `${sfMockProject.sfMock.programUrl}/${argParams.projectName}${url}`
      );
    } else {
      result.errorMsg = "请在项目列表中添加sf-mock";
    }
    return {
      response: {
        code: 200,
        data: {
          success: true,
          data: result,
        },
      },
    };
  };
})();
