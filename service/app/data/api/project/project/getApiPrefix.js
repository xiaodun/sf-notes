(function () {
  return function (argData, argParams, external) {
    argData = external.getBaseStructure(argData);

    let apiPrefixs = {};
    Object.keys(argData.apiPrefixs).forEach((prefix) => {
      argData.apiPrefixs[prefix].forEach((item) => {
        apiPrefixs[item] = { prefix };
      });
    });
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data: apiPrefixs,
        },
      },
    };
  };
})();
