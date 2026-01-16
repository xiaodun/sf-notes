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
    
    // 只更新名称，保持其他字段不变（包括加密数据、tags、records）
    behaviors[index] = {
      ...behaviors[index],
      name: argParams.name,
      updateTime: new Date().toISOString(),
    };
    
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

