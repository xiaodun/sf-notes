(function () {
  return function (argData, argParams) {
    const project = argData.projectList.find((item) => item.id == argParams.id);
    let success = true,
      message = "";
    if (project.snippetList.find((item) => item.name === argParams.name)) {
      success = false;
      message = "片段名重复";
    }
    if (success) {
      project.snippetList.push({
        name: argParams.name,
        isGroup: true,
        children: [],
      });
    }

    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success,
          message,
        },
      },
    };
  };
})();
