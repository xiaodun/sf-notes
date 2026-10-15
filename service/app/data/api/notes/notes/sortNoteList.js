(function () {
  return function (argData, argParams, external) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || [];
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
