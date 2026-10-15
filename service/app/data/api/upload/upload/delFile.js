(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || [];
    let file;
    let index = argData.findIndex((el, index, arr) => {
      if (el.id === argParams.id) {
        file = el;
        return true;
      }
    });
    argData.splice(index, 1);
    return {
      isWrite: true,
      data: argData,
      broadcast: {
        type: "others",
        data: {
          key: "FILE",
          type: "DELETE",
          file,
          id: argParams.id,
        },
      },
      isDelete: true,
      file,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
