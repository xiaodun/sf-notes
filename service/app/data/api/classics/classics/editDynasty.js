(function () {
  return function (argData, argParams) {
    const { id, ...updateData } = argParams;
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

    // 防重复：如果修改了名称，检查新名称是否已存在
    if (updateData.name && updateData.name !== data.dynasties[index].name) {
      const existing = data.dynasties.find(
        (item) =>
          !item.deleted && item.id !== id && item.name.trim() === updateData.name.trim()
      );
      if (existing) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: false,
              msg: "该朝代已存在",
            },
          },
        };
      }
    }

    data.dynasties[index] = {
      ...data.dynasties[index],
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

