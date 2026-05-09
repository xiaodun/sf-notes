(function () {
  return function (argData, argParams) {
    argData = argData || [];
    let id = argParams.id;
    let index = argData.findIndex((el) => el.id == id);
    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "未找到该日记",
          },
        },
      };
    }
    const notes = argData[index];
    if (!notes.deleted) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "该日记不在回收站中",
          },
        },
      };
    }
    notes.deleted = false;
    notes.updateTime = +new Date();
    argData.splice(index, 1);
    argData.unshift(notes);

    return {
      isWrite: true,
      data: argData,
      broadcast: {
        type: "others",
        data: {
          key: "NOTE",
          type: "RESTORE",
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
