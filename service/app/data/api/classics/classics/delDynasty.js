(function () {
  return function (argData, argParams) {
    const { id } = argParams;
    const data = argData || { authors: [], dynasties: [], classics: [] };
    data.dynasties = data.dynasties || [];
    const index = data.dynasties.findIndex((item) => item.id === id && !item.deleted);

    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到对应的朝代",
          },
        },
      };
    }

    // 检查是否有作者使用该朝代
    const hasAuthors = (data.authors || []).some(
      (item) => !item.deleted && item.dynastyId === id
    );
    if (hasAuthors) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "该朝代下有作者，无法删除",
          },
        },
      };
    }

    data.dynasties[index].deleted = true;

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

