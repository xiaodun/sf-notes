(function () {
  return function (argData, argParams, external) {
    argData = external.getBaseStructure(argData);
    const isExist = argData.projectList.some(
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
      argData.projectList.push(argParams);
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
