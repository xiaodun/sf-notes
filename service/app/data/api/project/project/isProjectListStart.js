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
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          list: argParams.projectList,
        },
      },
    };
  };
})();
