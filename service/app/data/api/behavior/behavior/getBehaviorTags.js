(function () {
  return function (argData, argParams) {
    const data = argData || { behaviors: [], globalTags: [] };
    const { behaviorId } = argParams || {};
    const behaviors = data.behaviors || [];
    const behavior = behaviors.find((b) => b.id === behaviorId);
    
    const behaviorTags = behavior?.tags || [];
    
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

