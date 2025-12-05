(function () {
  return function (argData, argParams) {
    const { id } = argParams;
    const data = argData || { authors: [], dynasties: [], classics: [] };
    data.authors = data.authors || [];
    const index = data.authors.findIndex((item) => item.id === id && !item.deleted);

    if (index === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "未找到对应的作者",
          },
        },
      };
    }

    // 检查是否有名篇使用该作者
    const hasClassics = (data.classics || []).some(
      (item) => !item.deleted && item.authorId === id
    );
    if (hasClassics) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "该作者下有名篇，无法删除",
          },
        },
      };
    }

    data.authors[index].deleted = true;

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

