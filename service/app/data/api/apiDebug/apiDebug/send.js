(function () {
  var http = require('http');
  var https = require('https');
  var urlModule = require('url');
  var fs = require('fs');
  var path = require('path');

  var CACHE_DIR = 'data/api/apiDebug/apiDebug/cache';

  function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  }

  function writeCache(apiId, cache) {
    try {
      ensureCacheDir();
      fs.writeFileSync(path.join(CACHE_DIR, apiId + '.json'), JSON.stringify(cache, null, 2));
    } catch (e) {}
  }

  return function (argData, argParams, external) {
    var apiId = argParams.apiId;
    var method = (argParams.method || 'GET').toUpperCase();
    var url = argParams.url || '';
    var query = argParams.query || '';
    var body = argParams.body || '';

    // 合并所属分组的 headers，并尝试拼接当前选中的 prefix
    var appHeaders = {};
    var apiIndex = argData.apis.findIndex(function (a) { return a.id === apiId; });
    if (apiIndex !== -1 && argData.apis[apiIndex].appId) {
      var app = argData.apps.find(function (a) { return a.id === argData.apis[apiIndex].appId; });
      if (app) {
        if (app.headers) {
          app.headers.forEach(function (h) {
            if (h.key && h.key.trim()) appHeaders[h.key.trim()] = h.value || '';
          });
        }
        // 找当前激活的 prefix（找不到激活的就用第一条）
        var activePrefix = '';
        if (app.prefixes && app.prefixes.length) {
          var active = app.prefixes.find(function (p) { return p.id === app.activePrefixId; });
          if (!active) active = app.prefixes[0];
          activePrefix = (active && active.value) || '';
        }
        if (activePrefix && url && !/^https?:\/\//i.test(url)) {
          var prefixStr = String(activePrefix).replace(/\/+$/, '');
          var pathPart = url.charAt(0) === '/' ? url : '/' + url;
          url = prefixStr + pathPart;
        }
      }
    }

    if (url && !/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }

    var targetUrl = url;
    if (method === 'GET' && query) {
      targetUrl = url + (url.indexOf('?') === -1 ? '?' : '&') + query;
    }

    var parsed = urlModule.parse(targetUrl);
    var isHttps = parsed.protocol === 'https:';
    var lib = isHttps ? https : http;
    var startTime = Date.now();

    var reqHeaders = Object.assign({ 'Content-Type': 'application/json' }, appHeaders);
    var reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : (isHttps ? 443 : 80),
      path: parsed.path || '/',
      method: method,
      headers: reqHeaders,
      timeout: 15000,
    };
    if (method === 'POST' && body) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    function persistAndRespond(result) {
      writeCache(apiId, {
        lastQuery: method === 'GET' ? query : '',
        lastBody: method === 'POST' ? body : '',
        lastMethod: method,
        lastResponse: result,
        updatedAt: Date.now(),
      });
      try { external.response.end(JSON.stringify({ success: true, result: result })); } catch (e) {}
    }

    var req = lib.request(reqOptions, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        var rawBody = Buffer.concat(chunks).toString('utf-8');
        var parsedBody = null;
        try { parsedBody = JSON.parse(rawBody); } catch (e) {}
        persistAndRespond({
          success: true,
          status: res.statusCode,
          elapsed: Date.now() - startTime,
          body: rawBody,
          parsedBody: parsedBody,
        });
      });
    });

    req.on('timeout', function () {
      req.destroy();
      persistAndRespond({ success: false, error: '请求超时（15s）', elapsed: 15000 });
    });
    req.on('error', function (e) {
      persistAndRespond({ success: false, error: e.message, elapsed: Date.now() - startTime });
    });

    if (method === 'POST' && body) req.write(body);
    req.end();

    // 主数据无需变更（缓存写到独立文件）
    return {
      async: true,
      isWrite: false,
      response: { code: 200, data: {} },
    };
  };
})();
