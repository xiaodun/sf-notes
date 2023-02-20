(function () {
  return function (argData, argParams, external) {
    argParams.id = Date.now();
    argParams.teamOddList = [];
    const fs = require("fs");
    argData.predictList.unshift(argParams);
    const folderPath = external.getPredictDataFolderPath(argParams.id);
    fs.mkdirSync(folderPath);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {},
      },
    };
  };
})();
