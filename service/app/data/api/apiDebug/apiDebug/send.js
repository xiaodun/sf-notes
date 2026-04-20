(function () {
  var http = require('http');
  var https = require('https');
  var urlModule = require('url');
  var path = require('path');
  var fs = require('fs');
  /** sf-inner-service 用 eval 执行本文件，相对 require 会解析到 node_modules，必须用绝对路径 */
  var _cacheStoragePath = path.join(process.cwd(), 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  if (!fs.existsSync(_cacheStoragePath)) {
    _cacheStoragePath = path.join(process.cwd(), 'service', 'app', 'data', 'api', 'apiDebug', 'apiDebug', 'cacheStorage.js');
  }
  var storage = require(_cacheStoragePath);

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
            var k = String((h && h.key) || '').trim();
            if (k) appHeaders[k] = String((h && h.value) || '').trim();
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

    var reqHeaders = Object.assign(
      {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      appHeaders
    );
    /** 大列表等接口可能较慢，与常见网关超时对齐 */
    var OUTBOUND_TIMEOUT_MS = 300000;
    var reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port) : (isHttps ? 443 : 80),
      path: parsed.path || '/',
      method: method,
      headers: reqHeaders,
      timeout: OUTBOUND_TIMEOUT_MS,
    };
    if (method === 'POST' && body) {
      reqOptions.headers['Content-Length'] = Buffer.byteLength(body);
    }

    function persistAndRespond(result) {
      var cachePayload = {
        lastQuery: method === 'GET' ? query : '',
        lastBody: method === 'POST' ? body : '',
        lastMethod: method,
        lastResponse: result,
        updatedAt: Date.now(),
      };
      try {
        storage.persistApiCache(apiId, cachePayload);
      } catch (e) {}
      var wire = storage.toClientResponseResult(result);
      try {
        external.response.end(JSON.stringify({ success: true, result: wire }));
      } catch (e2) {}
    }

    var req = lib.request(reqOptions, function (res) {
      var chunks = [];
      res.on('data', function (c) { chunks.push(c); });
      res.on('end', function () {
        var rawBody = Buffer.concat(chunks).toString('utf-8');
        var parsedBody = null;
        /** 超大 JSON 避免二次整包 parse 占内存；前端仍可用 body 原文展示 */
        var MAX_PARSE_CHARS = 2000000;
        var parseSkipped = rawBody.length > MAX_PARSE_CHARS;
        if (!parseSkipped) {
          try {
            parsedBody = JSON.parse(rawBody);
          } catch (e) {}
        }
        persistAndRespond({
          success: true,
          status: res.statusCode,
          statusText: res.statusMessage || undefined,
          elapsed: Date.now() - startTime,
          body: rawBody,
          parsedBody: parsedBody,
          parseSkipped: parseSkipped || undefined,
          bodyCharLength: parseSkipped ? rawBody.length : undefined,
        });
      });
    });

    req.on('timeout', function () {
      req.destroy();
      persistAndRespond({
        success: false,
        error: '请求超时（' + Math.round(OUTBOUND_TIMEOUT_MS / 1000) + 's）',
        elapsed: OUTBOUND_TIMEOUT_MS,
      });
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
