(function () {
  var path = require('path');
  var fs = require('fs');
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);

  return function (argData, argParams) {
    var apiId = argParams.apiId;
    if (apiId == null || apiId === '') {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: '缺少 apiId' },
        },
      };
    }
    var pathTokens = argParams.pathTokens;
    if (typeof pathTokens === 'string') {
      try {
        pathTokens = JSON.parse(pathTokens);
      } catch (e) {
        pathTokens = [];
      }
    }
    if (!Array.isArray(pathTokens)) pathTokens = [];
    var cursor = parseInt(argParams.cursor, 10);
    if (isNaN(cursor) || cursor < 0) cursor = 0;
    var limit = parseInt(argParams.limit, 10);
    if (isNaN(limit) || limit < 1) limit = 120;

    try {
      var out = storage.readResponseNodeSlice(apiId, pathTokens, cursor, limit);
      return {
        isWrite: false,
        response: {
          code: 200,
          data: Object.assign({ success: true }, out),
        },
      };
    } catch (e2) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: String(e2 && e2.message ? e2.message : e2) },
        },
      };
    }
  };
})();
