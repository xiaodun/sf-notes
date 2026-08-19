(function () {
  return function (argData, argParams) {
    var data = argData || { devices: [], executions: [] };
    var store = global.__sfScriptStore || { tasks: {} };
    var taskId = String(argParams.taskId || "").trim();
    var task = store.tasks[taskId];

    if (!task) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: true },
        },
      };
    }

    var record = {
      id: taskId,
      scriptId: task.scriptId,
      scriptName: task.scriptName,
      deviceId: task.deviceId || "",
      action: task.action || "",
      status: task.status,
      message: task.message,
      startTime: task.startTime,
      endTime: task.endTime,
      logs: (task.logs || []).slice(-20),
    };

    var executions = data.executions || [];
    executions.unshift(record);
    data.executions = executions.length > 30 ? executions.slice(0, 30) : executions;

    return {
      isWrite: true,
      data: data,
      response: {
        code: 200,
        data: { success: true },
      },
    };
  };
})();
