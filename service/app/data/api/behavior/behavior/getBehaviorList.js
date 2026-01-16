(function () {
  return function (argData, argParams) {
    const list = argData || [];
    const page = parseInt(argParams?.page) || 1;
    const pageSize = parseInt(argParams?.pageSize) || 10;
    
    // 分页处理
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = list.slice(start, end);
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: paginatedList,
          total: list.length,
        },
      },
    };
  };
})();

