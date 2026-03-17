(function () {
  return function (argData, argParams) {
    const originalImage = argParams.originalImage;
    const newName = argParams.newName;
    const compressionLevel = argParams.compressionLevel;
    const timestamp = +new Date();
    
    const newImage = {
      id: timestamp + '',
      name: newName,
      originalName: originalImage.originalName,
      url: `/api/image/image/getImageContent?id=${timestamp}`,
      size: originalImage.size,
      isProcessed: true,
      storage: {
        path: `uploads/processed/${newName}_${timestamp}`,
        timestamp: timestamp
      }
    };
    
    argData.unshift(newImage);
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
