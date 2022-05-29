(function () {
  return function (argData, argParams, external) {
    const sfNote = argData.projectList.find((item) => item.name === "sf-notes");
    if (sfNote && !sfNote.rootPath) {
      let pos = __dirname.indexOf("sf-notes") + "sf-notes".length;
      sfNote.rootPath = __dirname.substring(0, pos).replace(/\\/g, "//");
    }
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.projectList,
        },
      },
    };
  };
})();
