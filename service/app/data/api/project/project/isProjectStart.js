(function () {
  return function (argData, argParams) {
    const request = require("sync-request");

    let isStart = true;
    try {
      request("get", argParams.url);
    } catch (error) {
      console.log(error);
      isStart = false;
    }
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: isStart,
        },
      },
    };
  };
})();
