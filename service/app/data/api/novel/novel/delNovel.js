(function () {
  return function (argData, argParams) {
    const data = argData || [];
    const index = data.findIndex((item) => item.id === argParams.id);
    
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
    data.splice(index, 1);
    
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

