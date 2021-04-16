(function () {
  const fs = require("fs");
  return function (argData, argParams) {
    argData = argData || [];
    argData.introduce = "";
    argParams.id = Date.now() + "";
    argParams.createTime = Date.now();
    argParams.prefaceList = [];
    argParams.chapterList = [];
    argParams.epilogList = [];
    argData.push(argParams);
    fs.mkdirSync("./" + argParams.id);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
