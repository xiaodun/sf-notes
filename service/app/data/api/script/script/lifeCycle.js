(function () {
  return function () {
    if (!global.__sfScriptStore) {
      global.__sfScriptStore = { tasks: {}, seq: 0 };
    }

    return {
      createFloder: function (createFloder, external) {
        var store = global.__sfScriptStore;
        external.scriptTasks = store.tasks;
        external.scriptNextTaskId = function () {
          store.seq += 1;
          return String(store.seq);
        };
        external.scriptTrimExecutions = function (executions, max) {
          var limit = max || 30;
          if (!Array.isArray(executions)) return [];
          if (executions.length <= limit) return executions;
          return executions.slice(0, limit);
        };
      },
    };
  };
})();
