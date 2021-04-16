(function () {
  const fs = require("fs");
  return function (argData, argParams) {
    const book = argData.find((item) => item.id === argParams.id);
    let list;
    if (argParams.updateType === "preface") {
      list = book.prefaceList;
    } else if (argParams.updateType === "chapter") {
      list = book.chapterList;
    } else if (argParams.updateType === "epilog") {
      list = book.epilogList;
    }

    const timestamp = Date.now();
    const id = timestamp + "";
    let pieces = {
      id,
      title: "",
      content: "",
      createTime: timestamp,
      updateTime: timestamp,
    };
    list.splice(argParams.pos, 0, id);
    const filePath = `./${book.id}/${id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(pieces, null, 2));
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: id,
        },
      },
    };
  };
})();
