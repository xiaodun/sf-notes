(function () {
  return function (argData, argParams) {
    const { id, ...updateData } = argParams;
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

    // 防重复：如果修改了姓名或朝代，检查新组合是否已存在
    const newName = updateData.name ? updateData.name.trim() : data.authors[index].name;
    const newDynastyId = updateData.dynastyId || data.authors[index].dynastyId;
    if (
      newName !== data.authors[index].name ||
      newDynastyId !== data.authors[index].dynastyId
    ) {
      const existing = data.authors.find(
        (item) =>
          !item.deleted &&
          item.id !== id &&
          item.name === newName &&
          item.dynastyId === newDynastyId
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
    }

    data.authors[index] = {
      ...data.authors[index],
      ...updateData,
      updateTime: new Date().toISOString(),
    };

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

