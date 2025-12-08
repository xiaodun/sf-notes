(function () {
  return function (argData, argParams) {
    const { id } = argParams;
    argData = argData || [];
    const index = argData.findIndex((item) => item.id === id);
    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到要删除的数据",
          },
        },
      };
    }
    // 直接删除，从数组中移除
    argData.splice(index, 1);
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();

