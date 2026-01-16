(function () {
  return function (argData, argParams) {
    const list = argData || [];
    const { behaviorId } = argParams || {};
    
    // 过滤出该行为的标签
    const behaviorTags = list.filter(
      (item) => item.isGlobal !== true && item.behaviorId === behaviorId
    );
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: behaviorTags,
        },
      },
    };
  };
})();

