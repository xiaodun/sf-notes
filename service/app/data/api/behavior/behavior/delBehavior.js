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
            msg: "未找到要删除的数据",
          },
        },
      };
    }
    
    // 直接删除，从数组中移除
    behaviors.splice(index, 1);
    
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

