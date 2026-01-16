(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const behaviors = data.behaviors || [];
    
    // 查找对应的记录
    let recordIndex = -1;
    let targetBehavior = null;
    
    for (const behavior of behaviors) {
      if (behavior.records) {
        recordIndex = behavior.records.findIndex((item) => item.id === argParams.id);
        if (recordIndex !== -1) {
          targetBehavior = behavior;
          break;
        }
      }
    }
    
    if (recordIndex === -1 || !targetBehavior) {
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
    targetBehavior.records.splice(recordIndex, 1);
    
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

