(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    return {
      isWrite: true, //是否覆盖数据
      data: argParams || {}, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {},
      },
    };
  };
}) ();
