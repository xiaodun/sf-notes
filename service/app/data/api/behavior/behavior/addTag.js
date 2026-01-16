(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const newTag = {
      ...argParams,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    
    if (newTag.isGlobal) {
      // 全局标签添加到 globalTags 数组
      if (!data.globalTags) data.globalTags = [];
      data.globalTags.push(newTag);
    } else {
      // 行为标签添加到对应行为的 tags 属性
      const behaviors = data.behaviors || [];
      const behavior = behaviors.find((b) => b.id === newTag.behaviorId);
      if (behavior) {
        if (!behavior.tags) behavior.tags = [];
        behavior.tags.push(newTag);
      }
    }
    
    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: {
          success: true,
          data: newTag,
        },
      },
    };
  };
})();

