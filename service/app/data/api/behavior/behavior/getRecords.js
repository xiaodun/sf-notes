(function () {
  return function (argData, argParams) {
    const list = argData || [];
    const { behaviorId } = argParams || {};
    
    // 过滤出该行为的记录
    const records = list.filter((item) => item.behaviorId === behaviorId);
    
    // 按时间倒序排序
    records.sort((a, b) => b.datetime - a.datetime);
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: records,
        },
      },
    };
  };
})();

