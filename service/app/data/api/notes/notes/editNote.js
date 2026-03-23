(function () {
  return function (argData, argParams) {
    //argData 数据的副本
    let id = argParams.id;
    let index = argData.findIndex((el) => el.id === id);
    let notepad = {
      ...argData[index],
      updateTime: +new Date(),
      ...argParams,
    };
    argData.splice(index, 1, notepad);

    return {
      isWrite: true,
      data: argData,
      broadcast: {
        type: "others",
        data: {
          key: "NOTE",
          type: "NOTE_EDIT",
          note: notepad,
        },
      },
      response: {
        code: 200,
        data: {
          success: true,
          data: notepad,
        },
      },
    };
  };
})();
