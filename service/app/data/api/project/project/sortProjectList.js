(function () {
  return function (argData, argParams, external) {
    let delIndex = argParams.oldIndex;
    let addIndex = argParams.newIndex;
    if (argParams.oldIndex > argParams.newIndex) {
      delIndex++;
    } else {
      addIndex++;
    }
    argData.projectList.splice(
      addIndex,
      0,
      argData.projectList[argParams.oldIndex]
    );

    argData.projectList.splice(delIndex, 1);

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
