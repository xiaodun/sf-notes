(function () {
  return function (argData, argParams) {
    //最多存储多少已被删除的日记信息
    const saveDeletedNotesCountThreshold = 50;
    //argData 数据的副本
    let id = argParams.id;
    let index = argData.findIndex((el) => el.id == id);
    const notes = argData[index];
    notes.deleted = true;
    //删除的放在最后面
    argData.splice(index, 1);
    argData.push(notes);

    const countDeleted = argData.filter((item) => item.deleted).length;
    if (countDeleted > saveDeletedNotesCountThreshold) {
      //找到第一个被删除的彻底移除
      const firstDeleteNote = argData.findIndex((item) => item.deleted);
      argData.splice(firstDeleteNote, 1);
    }

    return {
      isWrite: true,
      data: argData,
      broadcast: {
        type: "others",
        data: {
          key: "NOTE",
          type: "DELETE",
          id,
        },
      },
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
