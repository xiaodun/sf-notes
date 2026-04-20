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
    var cursor = parseInt(argParams.cursor, 10);
    if (isNaN(cursor) || cursor < 0) cursor = 0;
    var limit = parseInt(argParams.limit, 10);
    if (isNaN(limit) || limit < 1) limit = 256 * 1024;

    try {
      var slice = storage.readResponseBodySlice(apiId, cursor, limit);
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            text: slice.text,
            nextCursor: slice.nextCursor,
            totalBytes: slice.totalBytes,
            eof: slice.eof,
          },
        },
      };
    } catch (e) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: false, message: String(e && e.message ? e.message : e) },
        },
      };
    }
  };
})();
