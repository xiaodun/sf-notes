(function () {
  return function (argData, argParams) {
    const isExist = argData.some((item) => item.name === argParams.name);
    if (isExist) {
      return {
        isWrite: false,

        response: {
          code: 200,
          data: {
            success: false,
            message: "项目已存在",
          },
        },
      };
    } else {
      argParams.id = Date.now();
      argData.push(argParams);
      return {
        isWrite: true,
        data: argData,
        response: {
          code: 200,
          data: {
            success: true,
            message: "添加成功",
          },
        },
      };
    }
  };
})();
