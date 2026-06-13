(function () {
  const path = require("path");

  return function (argData, argParams, external) {
    argData = argData || [];
    const file = argParams.files[0];
    if (file && file.flag) {
      file.flag = path.basename(file.flag);
    }
    argData.unshift(file);
    file.id = +new Date() + '';
    return {
      isWrite: true,
      data: argData,
      broadcast: {
        type: "others",
        data: {
          key: "FILE",
          type: "ADD",
          file,
        },
      },
      response: {
        code: 200,
        data: {
          success: true,
          list: argData,
        },
      },
    };
  };
})();
