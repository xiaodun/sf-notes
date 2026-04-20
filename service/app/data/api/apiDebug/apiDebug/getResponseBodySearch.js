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

    var q = argParams.q != null ? String(argParams.q) : '';

    var cursorByte = parseInt(argParams.cursorByte, 10);

    if (isNaN(cursorByte) || cursorByte < 0) cursorByte = 0;

    var maxScanBytes = parseInt(argParams.maxScanBytes, 10);

    var maxMatches = parseInt(argParams.maxMatches, 10);
    var overlapBytes = parseInt(argParams.overlapBytes, 10);



    try {

      var out = storage.searchResponseBody(apiId, q, cursorByte, maxScanBytes, maxMatches, overlapBytes);

      return {

        isWrite: false,

        response: {

          code: 200,

          data: {

            success: true,

            matches: out.matches,

            nextScanByte: out.nextScanByte,

            totalBytes: out.totalBytes,

            fileExhausted: out.fileExhausted,

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

