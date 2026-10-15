(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || [];
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
          type: "EDIT",
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
