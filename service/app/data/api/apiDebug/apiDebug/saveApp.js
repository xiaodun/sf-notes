(function () {
  var path = require('path');
  var fs = require('fs');
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);

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

    storage.writeMainDataWithRetry(argData);

    return {
      isWrite: false,
      response: { code: 200, data: { success: true, app: app } },
    };
  };
})();
