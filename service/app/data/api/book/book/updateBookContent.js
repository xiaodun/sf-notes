(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const { id, updateType, ...rest } = argParams;
    const book = argData.find((item) => item.id === argParams.id);
    if (updateType === "book") {
      Object.assign(book, rest);
    } else {
      const path = `./${argParams.id}/${
        argParams.prefaceId || argParams.chapterId || argParams.epilogId
      }.json`;
      const pieces = JSON.parse(fs.readFileSync(path));
      Object.assign(pieces, {
        ...rest,
        updateTime: Date.now(),
      });
      fs.writeFileSync(path, JSON.stringify(pieces, 0, 2));
    }
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
