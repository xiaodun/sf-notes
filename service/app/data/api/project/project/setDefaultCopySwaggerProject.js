(function () {
  return function (argData, argParams) {
    argData.projectList.forEach((item) => {
      if (item.id === argParams.id) {
        item.isDefaultCopySwagger = true;
      } else {
        item.isDefaultCopySwagger = false;
      }
    });

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
