(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const { behaviorId } = argParams;
    
    const newRecord = {
      ...argParams,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    
    // 找到对应的行为并添加记录
    const behaviors = data.behaviors || [];
    const behavior = behaviors.find((b) => b.id === behaviorId);
    
    if (!behavior) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到对应的行为",
          },
        },
      };
    }
    
    if (!behavior.records) behavior.records = [];
    behavior.records.push(newRecord);
    
    return {
      isWrite: true,
      data: data,
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

