(function () {
  return function (argData, argParams) {
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
          type: "FILE_DELETE",
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
