(function () {
  return function (argData, argParams) {
    const originalImage = argParams.originalImage;
    const newName = argParams.newName;
    const compressionLevel = argParams.compressionLevel;
    const timestamp = +new Date();
    
    const updatedImage = {
      ...originalImage,
      name: newName,
      url: `/api/image/image/getImageContent?id=${originalImage.id}`,
      isProcessed: true,
      storage: {
        path: `uploads/processed/${newName}_${timestamp}`,
        timestamp: timestamp
      }
    };
    
    const newData = argData.map(item => 
      item.id === originalImage.id ? updatedImage : item
    );
    
    return {
      isWrite: true,
      data: newData,
      response: {
        code: 200,
        data: {
          success: true,
          list: newData,
        },
      },
    };
  };
})();
