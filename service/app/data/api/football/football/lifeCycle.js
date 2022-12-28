(function () {
  return function () {
    const fs = require("fs");
    const path = require("path");
    const rootPath = "./data/api/football/football";
    return {
      createFloder: function (createFloder, external) {
        external.getPredictDataFolderPath = (id) => {
          return path.join(rootPath, id + "");
        };
      },
    };
  };
})();
