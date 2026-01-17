(function () {
  return function (argData, argParams) {
    const data = argData || [];
    const novel = argParams; // 整个 novel 对象作为参数
    const index = data.findIndex((item) => item.id === novel.id);
    
    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到要修改的数据",
          },
        },
      };
    }
    
    // 更新数据，保留原有字段，只更新传入的字段
    data[index] = {
      ...data[index],
      name: novel.name,
      path: novel.path,
      currentChapter: novel.currentChapter !== undefined ? novel.currentChapter : data[index].currentChapter,
      updateTime: new Date().toISOString(),
    };
    
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

