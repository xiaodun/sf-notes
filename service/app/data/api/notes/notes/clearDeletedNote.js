(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || [];
    const list = argData.filter((item) => !item.deleted);
    return {
      isWrite: true,
      data: list,
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
