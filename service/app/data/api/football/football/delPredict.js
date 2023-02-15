(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    const path = require("path");

    const predictIndex = argData.predictList.findIndex(
      (item) => item.id === argParams.id
    );
    const predictInfos = argData.predictList[predictIndex];

    predictInfos.teamOddList.forEach((name) => {
      const teamOddFilePath = path.join(
        external.getPredictDataFolderPath(argParams.id),
        name + ".json"
      );
      fs.unlinkSync(teamOddFilePath);
    });
    const folderPath = external.getPredictDataFolderPath(argParams.id);
    fs.rmdirSync(folderPath);

    argData.predictList.splice(predictIndex, 1);

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
