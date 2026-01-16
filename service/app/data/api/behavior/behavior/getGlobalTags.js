(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const globalTags = data.globalTags || [];
    
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

