(function () {
  return function (argData, argParams, external) {
    let delIndex = argParams.oldIndex;
    let addIndex = argParams.newIndex;
    if (argParams.oldIndex > argParams.newIndex) {
      delIndex++;
    } else {
      addIndex++;
    }
    argData.splice(addIndex, 0, argData[argParams.oldIndex]);

    argData.splice(delIndex, 1);

    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          list: argData,
        },
      },
    };
  };
})();
