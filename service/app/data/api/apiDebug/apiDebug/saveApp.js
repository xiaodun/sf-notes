(function () {
  return function (argData, argParams) {
    var app = argParams.app;
    if (app.id) {
      var idx = argData.apps.findIndex(function (a) { return a.id === app.id; });
      if (idx !== -1) argData.apps[idx] = Object.assign({}, argData.apps[idx], app);
    } else {
      app.id = Date.now();
      app.headers = app.headers || [];
      argData.apps.push(app);
    }
    return {
      isWrite: true,
      data: argData,
      response: { code: 200, data: { success: true, app: app } },
    };
  };
})();
