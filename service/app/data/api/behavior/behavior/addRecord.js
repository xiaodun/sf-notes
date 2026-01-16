(function () {
  return function (argData, argParams) {
    const list = argData || [];
    
    const newRecord = {
      ...argParams,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    
    list.push(newRecord);
    
    return {
      isWrite: true,
      data: list,
      response: {
        code: 200,
        data: {
          success: true,
          data: newRecord,
        },
      },
    };
  };
})();

