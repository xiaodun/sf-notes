(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const { behaviorId } = argParams || {};
    const behaviors = data.behaviors || [];
    const behavior = behaviors.find((b) => b.id === behaviorId);
    
    const records = behavior?.records || [];
    
    // 按时间倒序排序
    const sortedRecords = [...records].sort((a, b) => b.datetime - a.datetime);
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: sortedRecords,
        },
      },
    };
  };
})();

