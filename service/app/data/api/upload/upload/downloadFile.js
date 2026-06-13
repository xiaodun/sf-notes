(function () {
  return function (argData, argParams, argEnv) {
    let id = argParams.id;
    let file = "";
    argData.some((el, index, arr) => {
      if (el.id === id) {
        file = {
          flag: el.flag,
          name: el.name,
          type: el.type,
        };
        return true;
      }
    });
    if (!file) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "文件已被删除",
          },
        },
      };
    }
    return {
      isWrite: false,
      isDownload: true,
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
