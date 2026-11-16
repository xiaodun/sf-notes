// 上传残片清理（停止上传立即清理）
// 背景：formidable 是边接收边把字节写进临时文件（upload_<hex>）的。客户端中途停止/断网时，
// 请求的 end 不触发、addFile 不执行，upload.json 里没有这条记录，半截文件就成了没人管的孤儿，
// 一直占磁盘（超 5GB 上限失败的 upload 也会留下同样的残片）。
// 实现全部走 service.js 兜底，不改 node_modules：
// 1. 在 Service.start 之前包装 http.createServer，给上传请求（POST *addFile）挂监听：
//    响应没正常结束就断开（点了停止 / 断网 / 关页面）→ 延迟 1s 安排一次定向清理；
// 2. 判定规则：upload.json 里没有 flag 引用的 upload_* 文件才是候选；
//    间隔 3s 两次采样大小不变才删——还在传的文件大小持续增长，借此排除并发的正常上传；
//    再叠加 mtime 年龄下限双保险（定向清理 2s，定时兜底 60s）；
// 3. 启动时 + 每 10 分钟各兜底扫一遍。
// 不做「断开瞬间直接删」的原因：断开的连接拿不到 formidable 内部的临时文件名，
// 只能靠特征比对，而比对必须给正在传的文件留出生长观察期，所以从停止到删除约有 4s 延迟。

var file_os = require("fs");
var path_os = require("path");

var DEFAULT_OPTIONS = {
  uploadDir: "./data/api/upload/upload",
  listFile: null, // 默认 uploadDir 下的 upload.json
  sampleGapMs: 3000, // 两次大小采样的间隔
  abortCheckDelayMs: 1000, // 连接断开后延迟再采样，给 formidable 写完最后一批缓冲留时间
  abortMinMtimeAgeMs: 2000, // 定向清理的 mtime 年龄下限
  sweepMinMtimeAgeMs: 60000, // 定时兜底扫描的 mtime 年龄下限
  sweepIntervalMs: 10 * 60 * 1000, // 定时兜底扫描周期
};

module.exports = function setupUploadCleaner(userOptions) {
  var options = {};
  Object.keys(DEFAULT_OPTIONS).forEach(function (key) {
    options[key] =
      userOptions && userOptions[key] !== undefined
        ? userOptions[key]
        : DEFAULT_OPTIONS[key];
  });
  var listFile = options.listFile || path_os.join(options.uploadDir, "upload.json");

  function readReferencedFlags() {
    try {
      var list = JSON.parse(file_os.readFileSync(listFile, "utf-8"));
      var flags = {};
      (Array.isArray(list) ? list : []).forEach(function (item) {
        if (item && item.flag) {
          flags[item.flag] = true;
        }
      });
      return flags;
    } catch (error) {
      // 读不到列表就不清，宁可漏删不可误删
      return null;
    }
  }

  function cleanAbandonedUploads(minMtimeAgeMs) {
    var flags = readReferencedFlags();
    if (!flags) {
      return;
    }
    var candidates = [];
    try {
      file_os
        .readdirSync(options.uploadDir)
        .forEach(function (name) {
          if (/^upload_/.test(name) && !flags[name]) {
            try {
              candidates.push({
                name: name,
                size: file_os.statSync(path_os.join(options.uploadDir, name)).size,
              });
            } catch (error) {
              // stat 失败的跳过本轮
            }
          }
        });
    } catch (error) {
      return;
    }
    if (!candidates.length) {
      return;
    }
    // 观察期内大小不再增长、且修改时间超过下限的才认定是残片
    setTimeout(function () {
      candidates.forEach(function (candidate) {
        try {
          var filePath = path_os.join(options.uploadDir, candidate.name);
          var stat = file_os.statSync(filePath);
          if (stat.size !== candidate.size) {
            return; // 还在增长 = 正在传，跳过
          }
          if (Date.now() - stat.mtime.getTime() < minMtimeAgeMs) {
            return;
          }
          file_os.unlinkSync(filePath);
          console.log(
            "[upload-clean] 清理上传残片",
            candidate.name,
            candidate.size + "B"
          );
        } catch (error) {
          console.warn(
            "[upload-clean] 清理失败",
            candidate.name,
            error && error.message
          );
        }
      });
    }, options.sampleGapMs);
  }

  // 必须在 Service.start 之前调用：框架内部 require('http') 拿到的是同一个模块对象
  var http_os = require("http");
  var originalCreateServer = http_os.createServer;
  http_os.createServer = function (requestListener) {
    var server = originalCreateServer(requestListener);
    server.on("request", function (request, response) {
      if (request.method !== "POST" || request.url.indexOf("addFile") === -1) {
        return;
      }
      // 客户端异常断开时 response 不会走到 writableEnded
      response.on("close", function () {
        if (response.writableEnded) {
          return;
        }
        console.log("[upload-clean] 检测到上传连接中断", request.url);
        setTimeout(function () {
          cleanAbandonedUploads(options.abortMinMtimeAgeMs);
        }, options.abortCheckDelayMs);
      });
    });
    return server;
  };

  // 启动时清一次（此刻没有在传的文件，不需要观察期）
  cleanAbandonedUploads(0);
  setInterval(function () {
    cleanAbandonedUploads(options.sweepMinMtimeAgeMs);
  }, options.sweepIntervalMs);

  return { cleanAbandonedUploads: cleanAbandonedUploads };
};
