(function () {
  return function (argData, argParams) {
    // 确保 page 和 pageSize 是数字类型
    const page = parseInt(argParams?.page) || 1;
    const pageSize = parseInt(argParams?.pageSize) || 10;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    let paginatedList = argData.slice(start, end);
    
    console.log('paginatedList', start, end,paginatedList.length,argData.length);
    
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list: paginatedList,
          total: argData.length,
        },
      },
    };
  };
})();

