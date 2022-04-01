(function () {
  return function (argData, argParams) {
    const request = require("sync-request");
    argParams.projectList.forEach((project) => {
      let isStart = true;
      try {
        request("get", project.sfMock.programUrl);
      } catch (error) {
        console.log(error);
        isStart = false;
      }
      project.web.isStart = isStart;
    });
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argParams.projectList,
        },
      },
    };
  };
})();
