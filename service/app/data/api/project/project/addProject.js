(function () {
  return function (argData, argParams) {
    if (!argData) {
      argData = [];
    }
    const isExist = argData.some(
      (item) => item.rootPath === argParams.rootPath
    );
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
      argParams.name = argParams.rootPath.split("\\").pop();
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
