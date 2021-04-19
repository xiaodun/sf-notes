(function () {
  return function (argData, argParams) {
    const fs = require("fs");
    const book = argData.find((item) => item.id === argParams.id);
    addContent(book.prefaceList);
    addContent(book.chapterList);
    addContent(book.epilogList);
    //填充id和title
    function addContent(list) {
      list.forEach((pieceId, i, arr) => {
        const { id, title } = JSON.parse(
          fs.readFileSync(`./${argParams.id}/${pieceId}.json`)
        );
        arr[i] = {
          id,
          title,
        };
      });
    }
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: book,
        },
      },
    };
  };
})();
