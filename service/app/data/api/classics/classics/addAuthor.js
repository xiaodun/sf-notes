(function () {
  return function (argData, argParams) {
    const { name, dynastyId } = argParams;
    const data = argData || { authors: [], dynasties: [], classics: [] };

    // 防重复：检查作者名和朝代ID组合是否已存在
    const existing = (data.authors || []).find(
      (item) =>
        !item.deleted &&
        item.name.trim() === name.trim() &&
        item.dynastyId === dynastyId
    );
    if (existing) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "该作者已存在",
          },
        },
      };
    }

    const newAuthor = {
      name: name.trim(),
      dynastyId: dynastyId,
      id: Date.now() + "",
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
      deleted: false,
    };

    data.authors = data.authors || [];
    data.authors.push(newAuthor);

    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: {
          success: true,
          ...newAuthor,
        },
      },
    };
  };
})();





