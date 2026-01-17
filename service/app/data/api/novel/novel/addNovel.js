(function () {
  return function (argData, argParams) {
    const novel = argParams; // 整个 novel 对象作为参数
    const data = argData || [];
    
    // 确保保存必要的字段
    const newNovel = {
      name: novel.name || "",
      path: novel.path || "",
      currentChapter: novel.currentChapter || 1,
      id: Date.now().toString(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };
    
    data.push(newNovel);
    
    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: {
          success: true,
          data: newNovel,
        },
      },
    };
  };
})();

