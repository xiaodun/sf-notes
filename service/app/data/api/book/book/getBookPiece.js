(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const path = `./${argParams.id}/${
      argParams.prefaceId || argParams.chapterId || argParams.epilogId
    }.json`;
    const pieces = JSON.parse(fs.readFileSync(path));
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: pieces,
        },
      },
    };
  };
})();
