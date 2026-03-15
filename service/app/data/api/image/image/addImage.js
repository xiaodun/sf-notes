(function () {
  return function (argData, argParams) {
    argData = argData || [];
    const file = argParams.files?.[0] || argParams.file;
    const timestamp = +new Date();
    const originalName = file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const newName = `${nameWithoutExt}_${timestamp}${ext}`;
    
    file.id = timestamp + '';
    file.name = newName;
    file.originalName = originalName;
    file.url = `/api/image/image/getImageContent?id=${file.id}`;
    file.isProcessed = false;
    file.storage = {
      path: `uploads/original/${newName}`,
      timestamp: timestamp
    };
    
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
