(function () {
  return function (argData, argParams) {
    argData = argData || [];
    const file = argParams.files?.[0] || argParams.file;
    const timestamp = +new Date();
    const originalName = file.name;
    
    file.id = timestamp + '';
    file.originalName = originalName;
    
    argData.unshift(file);
    return {
      isWrite: true, //是否覆盖数据
      data: argData, //需要存储的新数据
      response: {
        //返回的数据
        code: 200,
        data: {
          success: true,
          list: argData,
        },
      },
    };
  };
})();
