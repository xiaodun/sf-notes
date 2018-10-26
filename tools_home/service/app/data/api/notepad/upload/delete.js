(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let file;
    let index = argData.findIndex ((el, index, arr) => {
      if (el.id === argParams.id) {
        file = el;
        return true;
      }
    });
    argData.splice (index, 1);
    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      isDelete: true,
      file,
      response: {
        //返回的数据
        code: 200,
        data: {},
      },
    };
  };
}) ();
