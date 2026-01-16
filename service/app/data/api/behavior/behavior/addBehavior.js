(function () {
  return function (argData, argParams) {
    const { behavior, index = 0 } = argParams;
    const data = argData || { behaviors: [], globalTags: [] };
    if (!data.behaviors) data.behaviors = [];
    if (!data.globalTags) data.globalTags = [];
    
    const newBehavior = {
      ...behavior,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
      tags: behavior.tags || [],
      records: behavior.records || [],
    };
    
    data.behaviors.splice(index, 0, newBehavior);
    
    return {
      isWrite: true,
      data: data,
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

