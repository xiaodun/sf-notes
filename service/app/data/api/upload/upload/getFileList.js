(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成空数组，避免 list 返回 null
    argData = argData || [];
    //argData 数据的副本
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          list: argData,
        },
      },
    };
  };
})();
