(function () {
  return function (argData, argParams, external) {
    const path = require("path");
    const fs = require("fs");
    const predictInfo = argData.predictList.find(
      (item) => item.id == argParams.id
    );
    const list = predictInfo.teamOddList.map((item) => {
      const teamOddFilePath = path.join(
        external.getPredictDataFolderPath(argParams.id),
        item + ".json"
      );
      return JSON.parse(fs.readFileSync(teamOddFilePath));
    });

    return {
      response: {
        code: 200,
        data: {
          success: true,
          list,
        },
      },
    };
  };
})();
