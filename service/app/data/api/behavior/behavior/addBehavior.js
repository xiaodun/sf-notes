(function () {
  return function (argData, argParams) {
    const { behavior, index = 0 } = argParams;
    const list = argData || [];
    
    const newBehavior = {
      ...behavior,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    
    list.splice(index, 0, newBehavior);
    
    return {
      isWrite: true,
      data: list,
      response: {
        code: 200,
        data: {
          success: true,
          data: newBehavior,
        },
      },
    };
  };
})();

