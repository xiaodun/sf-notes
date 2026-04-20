(function () {
  var fs = require('fs');
  var path = require('path');
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);
  var CACHE_DIR = 'data/api/apiDebug/apiDebug/cache';

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
      var p = path.join(CACHE_DIR, String(apiId) + '.json');
      if (!fs.existsSync(p)) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: { success: false, message: '无本地缓存' },
          },
        };
      }
      storage.migrateLegacyBodyToSidecarIfNeeded(apiId);
      storage.ensurePublicHeadForSidecar(apiId);
      storage.ensureBodyEnvelopeForSidecar(apiId);
      var cache = JSON.parse(fs.readFileSync(p, 'utf-8'));
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            lastQuery: cache.lastQuery || '',
            lastBody: cache.lastBody || '',
            lastMethod: cache.lastMethod || '',
            lastResponse: cache.lastResponse || null,
            updatedAt: cache.updatedAt || null,
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
