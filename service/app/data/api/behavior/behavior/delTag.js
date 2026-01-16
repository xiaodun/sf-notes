(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    
    // 先查找是否是全局标签
    if (!data.globalTags) data.globalTags = [];
    let tagIndex = data.globalTags.findIndex((item) => item.id === argParams.id);
    
    if (tagIndex !== -1) {
      // 删除全局标签
      data.globalTags.splice(tagIndex, 1);
    } else {
      // 查找行为标签
      const behaviors = data.behaviors || [];
      let found = false;
      for (const behavior of behaviors) {
        if (behavior.tags) {
          tagIndex = behavior.tags.findIndex((item) => item.id === argParams.id);
          if (tagIndex !== -1) {
            behavior.tags.splice(tagIndex, 1);
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              msg: "未找到要删除的数据",
            },
          },
        };
      }
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

