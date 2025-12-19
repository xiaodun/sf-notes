(function () {
  return function (argData, argParams) {
    const { name, dynastyId, page = 1, pageSize = 20 } = argParams || {};
    const data = argData || { authors: [], dynasties: [], classics: [] };
    let allAuthors = data.authors || [];

    // 搜索过滤
    if (name) {
      allAuthors = allAuthors.filter((item) => item.name.includes(name));
    }
    if (dynastyId) {
      allAuthors = allAuthors.filter((item) => item.dynastyId === dynastyId);
    }

    // 分页处理
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const list = allAuthors.slice(startIndex, endIndex);

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
