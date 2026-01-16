(function () {
  return function (argData, argParams) {
    const list = argData || [];
    const index = list.findIndex((item) => item.id === argParams.id);
    
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
    list.splice(index, 1);
    
    return {
      isWrite: true,
      data: list,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();

