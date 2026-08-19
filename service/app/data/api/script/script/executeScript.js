(function () {
  var spawnSync = require("child_process").spawnSync;
  var fs = require("fs");
  var os = require("os");
  var path = require("path");

  function resolveAdbBin() {
    var env = process.env;
    var platform = os.platform();
    var candidates = [];

    if (env.ANDROID_HOME) {
      candidates.push(
        path.join(env.ANDROID_HOME, "platform-tools", platform === "win32" ? "adb.exe" : "adb")
      );
    }
    if (env.LOCALAPPDATA) {
      candidates.push(
        path.join(env.LOCALAPPDATA, "Android", "Sdk", "platform-tools", "adb.exe")
      );
    }
    candidates.push(platform === "win32" ? "adb.exe" : "adb");

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      if (c.indexOf(path.sep) !== -1 && fs.existsSync(c)) {
        return c;
      }
    }

    try {
      var whereCmd = platform === "win32" ? "where adb 2>nul" : "command -v adb 2>/dev/null";
      var found = spawnSync(platform === "win32" ? "cmd" : "sh", platform === "win32" ? ["/c", whereCmd] : ["-c", whereCmd], {
        encoding: "utf8",
        timeout: 5000,
        windowsHide: true,
      })
        .stdout.trim()
        .split(/\r?\n/)[0];
      if (found) return found;
    } catch (_) {}

    return platform === "win32" ? "adb.exe" : "adb";
  }

  function runCommand(bin, args, options) {
    options = options || {};
    try {
      var result = spawnSync(bin, args, {
        encoding: "utf8",
        timeout: options.timeout || 30000,
        windowsHide: true,
        env: process.env,
        shell: false,
      });
      var stdout = (result.stdout || "").trim();
      var stderr = (result.stderr || "").trim();
      var output = [stdout, stderr].filter(Boolean).join("\n").trim();
      return {
        ok: result.status === 0,
        exitCode: result.status,
        stdout: stdout,
        stderr: stderr,
        output: output || (result.error ? result.error.message : ""),
      };
    } catch (e) {
      return {
        ok: false,
        exitCode: -1,
        stdout: "",
        stderr: String(e.message || e),
        output: String(e.message || e),
      };
    }
  }

  function pushLog(task, level, text) {
    if (!task.logs) task.logs = [];
    task.logs.push({
      time: Date.now(),
      level: level || "info",
      text: String(text || ""),
    });
  }

  function runAdbStep(task, adb, args, label) {
    pushLog(task, "info", "$ adb " + args.join(" "));
    var result = runCommand(adb, args);
    if (result.output) {
      pushLog(task, result.ok ? "info" : "error", result.output);
    }
    if (label) {
      task.steps = task.steps || [];
      task.steps.push({ label: label, ok: result.ok, output: result.output });
    }
    return result;
  }

  function normalizeAddress(address) {
    return String(address || "").trim();
  }

  function normalizePort(port) {
    var n = parseInt(port, 10);
    if (!n || n <= 0 || n > 65535) return 0;
    return n;
  }

  function executeAdbWireless(task, adb, params) {
    var address = normalizeAddress(params.address);
    var connectPort = normalizePort(params.connectPort);
    var mode = String(params.mode || "connect").trim();

    if (!address) {
      pushLog(task, "error", "设备地址不能为空");
      return { ok: false, message: "设备地址不能为空" };
    }
    if (!connectPort) {
      pushLog(task, "error", "连接端口无效");
      return { ok: false, message: "连接端口无效" };
    }

    if (mode === "pair") {
      var pairPort = normalizePort(params.pairPort);
      var pairCode = String(params.pairCode || "").trim();
      if (!pairPort) {
        pushLog(task, "error", "配对端口无效");
        return { ok: false, message: "配对端口无效" };
      }
      if (!/^\d{6}$/.test(pairCode)) {
        pushLog(task, "error", "配对码须为 6 位数字");
        return { ok: false, message: "配对码须为 6 位数字" };
      }

      pushLog(task, "info", "执行方式：配对并连接");
      var pairResult = runAdbStep(
        task,
        adb,
        ["pair", address + ":" + pairPort, pairCode],
        "pair"
      );
      if (!pairResult.ok) {
        return { ok: false, message: "配对失败" };
      }
    } else {
      pushLog(task, "info", "执行方式：直接连接");
    }

    var connectResult = runAdbStep(
      task,
      adb,
      ["connect", address + ":" + connectPort],
      "connect"
    );
    if (!connectResult.ok) {
      return { ok: false, message: "连接失败" };
    }

    runAdbStep(task, adb, ["devices", "-l"], "devices");
    return { ok: true, message: "执行完成" };
  }

  function executeBuiltin(task, builtinKey, params) {
    var adb = resolveAdbBin();

    pushLog(task, "info", "ADB: " + adb);

    if (builtinKey === "adb-wireless") {
      return executeAdbWireless(task, adb, params);
    }

    pushLog(task, "error", "未知内置脚本: " + builtinKey);
    return { ok: false, message: "未知内置脚本" };
  }

  function getStore() {
    if (!global.__sfScriptStore) {
      global.__sfScriptStore = { tasks: {}, seq: 0 };
    }
    return global.__sfScriptStore;
  }

  return function (argData, argParams, external) {
    var store = getStore();
    store.seq += 1;
    var taskId = String(store.seq);
    var tasks = store.tasks;

    var task = {
      id: taskId,
      scriptId: argParams.scriptId || "",
      scriptName: argParams.scriptName || "",
      deviceId: argParams.deviceId || "",
      action: argParams.action || "",
      status: "running",
      logs: [],
      steps: [],
      startTime: Date.now(),
      endTime: null,
      message: "",
    };
    tasks[taskId] = task;

    var params = argParams.params || {};

    setImmediate(function () {
      try {
        var result = executeBuiltin(task, argParams.builtinKey, params);
        task.status = result.ok ? "success" : "failed";
        task.message = result.message || "";
      } catch (e) {
        task.status = "failed";
        task.message = String(e.message || e);
        pushLog(task, "error", task.message);
      }
      task.endTime = Date.now();
    });

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: { taskId: taskId },
        },
      },
    };
  };
})();
