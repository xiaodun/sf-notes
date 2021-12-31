(function () {
  return function (argData, argParams) {
    const request = require("sync-request");

    let isStart = true;
    let isError = false;

    try {
      request("get", argParams.url);
    } catch (error) {
      console.log(error);
      isStart = false;
      isError = true;
    }
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,

          data: {
            isStart,
            isError,
          },
        },
      },
    };
  };
})();
