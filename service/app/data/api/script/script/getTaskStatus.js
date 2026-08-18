(function () {
  return function (argData, argParams) {
    var store = global.__sfScriptStore || { tasks: {} };
    var taskId = String(argParams.taskId || "").trim();
    var task = store.tasks[taskId];

    if (!task) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            data: {
              id: taskId,
              status: "missing",
              logs: [],
              steps: [],
              message: "",
              startTime: 0,
              endTime: null,
            },
          },
        },
      };
    }

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            id: task.id,
            status: task.status,
            logs: task.logs || [],
            steps: task.steps || [],
            message: task.message || "",
            startTime: task.startTime,
            endTime: task.endTime,
            scriptId: task.scriptId,
            scriptName: task.scriptName,
          },
        },
      },
    };
  };
})();
