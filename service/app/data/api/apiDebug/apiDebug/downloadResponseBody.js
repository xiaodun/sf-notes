(function () {
  var fs = require('fs');
  var path = require('path');
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);

  function safeApiId(v) {
    var s = String(v == null ? '' : v).trim();
    if (!/^-?\d+$/.test(s)) return null;
    return s;
  }

  return function (argData, argParams, external) {
    var apiId = safeApiId(argParams.apiId);
    if (!apiId) {
      try {
        external.response.setHeader('Content-Type', 'application/json; charset=utf-8');
        external.response.end(JSON.stringify({ success: false, message: '缺少或非法的 apiId' }));
      } catch (e) {}
      return { async: true, response: { code: 200 } };
    }
    try {
      storage.migrateLegacyBodyToSidecarIfNeeded(apiId);
      var side = storage.bodyPath(apiId);
      if (!fs.existsSync(side)) {
        try {
          external.response.setHeader('Content-Type', 'application/json; charset=utf-8');
          external.response.end(JSON.stringify({ success: false, message: '无外置正文文件' }));
        } catch (e2) {}
        return { async: true, response: { code: 200 } };
      }
      external.response.setHeader('Content-Type', 'text/plain; charset=utf-8');
      external.response.setHeader(
        'Content-Disposition',
        'attachment; filename="' + apiId + '-response-raw-body.txt"',
      );
      var stream = fs.createReadStream(side);
      stream.on('error', function () {
        try {
          external.response.end();
        } catch (e3) {}
      });
      stream.pipe(external.response);
    } catch (e4) {
      try {
        external.response.setHeader('Content-Type', 'application/json; charset=utf-8');
        external.response.end(
          JSON.stringify({ success: false, message: String(e4 && e4.message ? e4.message : e4) }),
        );
      } catch (e5) {}
    }
    return { async: true, response: { code: 200 } };
  };
})();
