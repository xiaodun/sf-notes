(function () {
  return function (argData, argParams) {
    const data = argData || [];
    const novel = data.find((item) => item.id === argParams.id);
    
    if (!novel) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到该小说",
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
          data: novel,
        },
      },
    };
  };
})();

