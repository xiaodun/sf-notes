(function () {
  return function (argData, argParams) {
    const { name, page = 1, pageSize = 20 } = argParams || {};
    const data = argData || { authors: [], dynasties: [], classics: [] };
    let allDynasties = data.dynasties || [];

    // 搜索过滤
    if (name) {
      allDynasties = allDynasties.filter((item) => item.name.includes(name));
    }

    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const list = allDynasties.slice(startIndex, endIndex);

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: list,
        },
      },
    };
  };
})();

