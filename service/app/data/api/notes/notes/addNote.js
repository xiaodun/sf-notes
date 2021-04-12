(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    if (argData === null) {
      argData = [];
    }
    const { notes, index } = argParams;
    notes.createTime = +new Date();
    notes.id = notes.createTime;
    notes.updateTime = '';
    argData.splice(index, -1, notes);

    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          data: notes,
        },
      },
    };
  };
})();
