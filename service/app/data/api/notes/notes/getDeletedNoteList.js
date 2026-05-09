(function () {
  return function (argData, argParams) {
    const raw = argData || [];
    const deleted = raw.filter((item) => item.deleted);
    // 最近删除的排在数组末尾，列表按「最近删除优先」展示
    const list = deleted.slice().reverse();
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list,
        },
      },
    };
  };
})();
