(function () {
  return function (argData, argParams) {
    const list = argData || [];
    
    // 过滤出全局标签
    const globalTags = list.filter((item) => item.isGlobal === true);
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: globalTags,
        },
      },
    };
  };
})();

