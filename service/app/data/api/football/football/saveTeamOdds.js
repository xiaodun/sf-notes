(function () {
  return function (argData, argParams, external) {
    const path = require("path");
    const fs = require("fs");
    const predictInfo = argData.predictList.find(
      (item) => item.id == argParams.id
    );
    let teamOddId = Date.now() + "";
    predictInfo.teamOddList.push(teamOddId);
    const teamOddFilePath = path.join(
      external.getPredictDataFolderPath(argParams.id),
      teamOddId + ".json"
    );

    fs.writeFileSync(
      teamOddFilePath,
      JSON.stringify(argParams.teamOdds, null, 2)
    );

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
