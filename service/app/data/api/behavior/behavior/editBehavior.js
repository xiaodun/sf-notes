(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const behaviors = data.behaviors || [];
    const index = behaviors.findIndex((item) => item.id === argParams.id);
    
    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到要修改的数据",
          },
        },
      };
    }
    
    // 更新传入的所有字段（name、encryptedData、encryptedName等）
    behaviors[index] = {
      ...behaviors[index],
      name: argParams.name,
      updateTime: new Date().toISOString(),
    };
    
    // 如果传入了加密相关字段，更新它们
    if (argParams.encryptedData !== undefined) {
      behaviors[index].encryptedData = argParams.encryptedData;
    }
    if (argParams.encryptedName !== undefined) {
      behaviors[index].encryptedName = argParams.encryptedName;
    }
    
    // 如果 encryptedData 和 encryptedName 都是 undefined，说明要清除加密
    if (argParams.encryptedData === undefined && argParams.encryptedName === undefined && behaviors[index].encryptedData) {
      delete behaviors[index].encryptedData;
      delete behaviors[index].encryptedName;
    }
    
    // 如果传入了 records，更新记录数组（用于批量解密记录）
    if (argParams.records !== undefined) {
      behaviors[index].records = argParams.records;
    }
    
    // 如果传入了 tags，更新标签数组（用于批量解密标签）
    if (argParams.tags !== undefined) {
      behaviors[index].tags = argParams.tags;
    }
    
    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();

