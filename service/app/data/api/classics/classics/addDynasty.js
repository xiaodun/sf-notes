(function () {
  return function (argData, argParams) {
    const { name } = argParams;
    const data = argData || { authors: [], dynasties: [], classics: [] };

    // 防重复：检查朝代名是否已存在
    const existing = (data.dynasties || []).find(
      (item) => !item.deleted && item.name.trim() === name.trim()
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

    const newDynasty = {
      name: name.trim(),
      id: Date.now() + "",
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
      deleted: false,
    };

    data.dynasties = data.dynasties || [];
    data.dynasties.push(newDynasty);

    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: {
          success: true,
          ...newDynasty,
        },
      },
    };
  };
})();

