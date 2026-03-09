(function () {
  return function (argData, argParams) {
    let data = argData;
    let isWrite = false;
    if (!data) {
      data = [];
      isWrite = true;
    }
    const page = parseInt(argParams?.page) || 1;
    const pageSize = parseInt(argParams?.pageSize) || 10;
    
    // 分页处理
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedList = data.slice(start, end);
    
    return {
      isWrite,
      data,
      response: {
        code: 200,
        data: {
          success: true,
          list: paginatedList,
          total: data.length,
        },
      },
    };
  };
})();

