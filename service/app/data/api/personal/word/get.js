(function () {
  return function (argData = [], argParams) {
    //argData 数据的副本
    let index;
    if (argParams.index != undefined) {
      index = argParams.index;
    } else {
      index = (Math.random () * argData.length) | 0;
    }
    return {
      isWrite: false, //是否覆盖数据
      //data:argData,//需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          data: argData[index],
          current: index,
          total: argData.length,
        },
      },
    };
  };
}) ();
