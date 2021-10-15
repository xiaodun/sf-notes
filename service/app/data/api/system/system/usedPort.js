(function () {
  return function (argData, argParams) {
    const net_os = require("net");

    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data: true,
        },
      },
    };
  };
})();
