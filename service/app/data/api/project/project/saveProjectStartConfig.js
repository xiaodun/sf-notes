(function () {
  return function (argData, argParams, external) {
    const projectId = Number(argParams.projectId);
    const commands = Array.isArray(argParams.commands) ? argParams.commands : [];
    const runUrl = String(argParams.runUrl || "").trim();
    const validCommands = commands
      .map((item) => String(item || "").trim())
      .filter(Boolean);
    if (!projectId) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "参数错误",
          },
        },
      };
    }
    const projectIndex = (argData.projectList || []).findIndex((item) => item.id === projectId);
    if (projectIndex === -1) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "项目不存在",
          },
        },
      };
    }
    argData.projectList[projectIndex].startConfig = {
      commands: validCommands,
      runUrl,
    };
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: true,
        },
      },
    };
  };
})();
