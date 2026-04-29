(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    const path = require("path");
    external.createSwaggerFolder();
    argData.swaggerList.forEach((item) => {
      item.data = JSON.parse(
        fs
          .readFileSync(
            path.join(external.getSwaggerFolderPath(), item.id + ".json")
          )
          .toString()
      ).data;
    });
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.swaggerList,
        },
      },
    };
  };
})();
