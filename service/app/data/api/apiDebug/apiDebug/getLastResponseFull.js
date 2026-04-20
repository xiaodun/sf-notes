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
    try {
      var built = storage.buildLastResponseForExport(apiId);
      if (!built.ok) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: { success: false, message: built.message },
          },
        };
      }
      if (built.mode === 'stream') {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: true,
              mode: 'stream',
              byteSize: built.byteSize,
              message: '正文较大，已改为文件下载',
            },
          },
        };
      }
      return {
        isWrite: false,
        response: {
          code: 200,
          data: { success: true, mode: 'json', result: built.result },
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
