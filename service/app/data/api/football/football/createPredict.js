(function () {
  return function (argData, argParams, external) {
    if (argParams.isEdit) {
      const index = argData.predictList.findIndex(
        (item) => item.id == argParams.id
      );
      argData.predictList[index] = {
        ...argData.predictList[index],
        ...argParams,
      };
    } else {
      argParams.id = Date.now();
      argParams.teamOddList = [];
      argParams.bonusItems = {};
      const fs = require('fs');
      argData.predictList.unshift(argParams);
      const folderPath = external.getPredictDataFolderPath(argParams.id);
      fs.mkdirSync(folderPath);
    }
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
