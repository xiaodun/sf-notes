(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const behaviors = data.behaviors || [];
    const behavior = behaviors.find((item) => item.id === argParams.id);
    
    if (!behavior) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到该行为",
          },
        },
      };
    }
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: behavior,
        },
      },
    };
  };
})();

