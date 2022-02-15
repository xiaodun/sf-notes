(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    if (argData === null) {
      argData = [];
    }
    let { notes, index } = argParams;
    // 标题不能重复

    let originIndex = argData
      .filter((item) => !item.deleted)
      .findIndex((el) => el.title === notes.title);
    if (originIndex != -1) {
      argData[originIndex] = notes = {
        ...argData[originIndex],
        updateTime: +new Date(),
        ...notes,
      };
    } else {
      notes.createTime = +new Date();
      notes.id = notes.createTime;
      notes.updateTime = "";
      argData.splice(index, -1, notes);
    }

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
