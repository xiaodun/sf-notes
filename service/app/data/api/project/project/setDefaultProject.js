(function () {
  return function (argData, argParams) {
    argData.projectList.forEach((item) => {
      if (item.id === argParams.id) {
        item.isDefault = true;
      } else {
        item.isDefault = false;
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
