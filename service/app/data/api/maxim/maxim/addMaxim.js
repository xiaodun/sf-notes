(function () {
  return function (argData, argParams) {
    const { maxim, index = 0 } = argParams;
    const list = argData || [];
    
    const newMaxim = {
      ...maxim,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    
    list.splice(index, 0, newMaxim);
    
    return {
      isWrite: true,
      data: list,
      response: {
        code: 200,
        data: {
          success: true,
          data: newMaxim,
        },
      },
    };
  };
})();
