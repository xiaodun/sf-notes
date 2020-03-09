(function() {
  return function(argData, argParams) {
    //argData 数据的副本
    if (argData === null) {
      argData = [];
    }
    const { notepad, index } = argParams;
    notepad.createTime = +new Date();
    notepad.id = notepad.createTime;
    notepad.updateTime = "";
    argData.splice(index, -1, notepad);

    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          data: notepad,
          total: argData.length
        }
      }
    };
  };
})();
