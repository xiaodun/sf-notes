(function () {
  var path = require('path');
  var fs = require('fs');
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);

  function delCache(apiId) {
    storage.deleteApiCacheFiles(apiId);
  }

  return function (argData, argParams) {
    delCache(argParams.id);
    argData.apis = argData.apis.filter(function (a) { return a.id !== argParams.id; });

    storage.writeMainDataWithRetry(argData);

    return {
      isWrite: false,
      response: { code: 200, data: { success: true } },
    };
  };
})();
