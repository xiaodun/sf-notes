(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let id = argParams.id;
    let index = argData.findIndex((el) => {
      if (el.id == id) {
        return true;
      }
    });
    argData.splice(index, 1);
    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
