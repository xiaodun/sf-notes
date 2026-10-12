(function () {
  var spawnSync = require("child_process").spawnSync;
  var fs = require("fs");
  var os = require("os");
  var path = require("path");

  function isRunnable(file) {
    try {
      fs.accessSync(file, fs.constants ? fs.constants.X_OK : fs.X_OK);
      return true;
    } catch (_) {
      return false;
    }
  }

  function pushCandidate(list, candidate) {
    if (candidate && list.indexOf(candidate) === -1) list.push(candidate);
  }

  // 收集 adb 候选路径：显式配置 > SDK 环境变量 > 各平台默认安装位置 > PATH 逐目录扫描
  function buildAdbCandidates() {
    var env = process.env;
    var win = os.platform() === "win32";
    var exe = win ? "adb.exe" : "adb";
    var candidates = [];

    pushCandidate(candidates, env.SF_ADB_PATH);
    pushCandidate(candidates, env.ADB_PATH);

    var sdkRoots = [env.ANDROID_HOME, env.ANDROID_SDK_ROOT, env.ANDROID_SDK_HOME];
    for (var i = 0; i < sdkRoots.length; i++) {
      if (sdkRoots[i]) pushCandidate(candidates, path.join(sdkRoots[i], "platform-tools", exe));
    }

    if (env.LOCALAPPDATA) {
      pushCandidate(candidates, path.join(env.LOCALAPPDATA, "Android", "Sdk", "platform-tools", exe));
    }
    if (env.USERPROFILE) {
      pushCandidate(
        candidates,
        path.join(env.USERPROFILE, "AppData", "Local", "Android", "Sdk", "platform-tools", exe)
      );
    }

    var home = "";
    try {
      home = os.homedir();
    } catch (_) {}
    if (home) {
      if (win) {
        pushCandidate(
          candidates,
          path.join(home, "AppData", "Local", "Android", "Sdk", "platform-tools", exe)
        );
      } else {
        // macOS 默认 ~/Library/Android/sdk；Linux 默认 ~/Android/Sdk
        pushCandidate(candidates, path.join(home, "Library", "Android", "sdk", "platform-tools", exe));
        pushCandidate(candidates, path.join(home, "Android", "Sdk", "platform-tools", exe));
        pushCandidate(candidates, path.join(home, "Android", "sdk", "platform-tools", exe));
      }
    }

    if (!win) {
      // 从 Finder / GUI 启动服务时 PATH 常常只有 /usr/bin:/bin:/usr/sbin:/sbin
      pushCandidate(candidates, "/opt/homebrew/bin/" + exe);
      pushCandidate(candidates, "/usr/local/bin/" + exe);
      pushCandidate(candidates, "/usr/bin/" + exe);
    }

    var dirs = String(env.PATH || "").split(win ? ";" : ":");
    for (var j = 0; j < dirs.length; j++) {
      var dir = dirs[j].trim();
      if (dir) pushCandidate(candidates, path.join(dir, exe));
    }

    return candidates;
  }

  function probeAdbInShell() {
    var win = os.platform() === "win32";
    try {
      var result = spawnSync(
        win ? "cmd" : "sh",
        win ? ["/c", "where adb"] : ["-c", "command -v adb"],
        { encoding: "utf8", timeout: 5000, windowsHide: true }
      );
      var first = String((result && result.stdout) || "")
        .trim()
        .split(/\r?\n/)[0]
        .trim();
      if (first && fs.existsSync(first)) return first;
    } catch (_) {}
    return "";
  }

  // 返回 { bin, candidates, found }；找不到时 bin 为 null，由调用方给出可操作的提示
  function resolveAdbBin() {
    var win = os.platform() === "win32";
    var candidates = buildAdbCandidates();

    for (var i = 0; i < candidates.length; i++) {
      if (fs.existsSync(candidates[i]) && (win || isRunnable(candidates[i]))) {
        return { bin: candidates[i], candidates: candidates, found: true };
      }
    }

    var probed = probeAdbInShell();
    if (probed) return { bin: probed, candidates: candidates, found: true };

    return { bin: null, candidates: candidates, found: false };
  }

  function describeSpawnError(bin, error) {
    if (!error) return "";
    if (error.code === "ENOENT") {
      return (
        "找不到可执行文件 " +
        bin +
        "（ENOENT）：adb 不在服务进程的运行环境里，请安装 platform-tools，或设置 ANDROID_HOME / SF_ADB_PATH"
      );
    }
    return String(error.message || error);
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
        output: output || describeSpawnError(bin, result.error),
      };
    } catch (e) {
      return {
        ok: false,
        exitCode: -1,
        stdout: "",
        stderr: String(e.message || e),
        output: describeSpawnError(bin, e) || String(e.message || e),
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

  function isAdbOutputFailure(output) {
    var text = String(output || "").toLowerCase();
    if (!text) return true;
    return /failed to connect|unable to connect|cannot connect|connection refused|积极拒绝|无法连接|error:|failed to pair|pairing failed/.test(
      text
    );
  }

  function isAdbConnectSuccess(output) {
    var text = String(output || "").toLowerCase();
    if (!text || isAdbOutputFailure(output)) return false;
    return /connected to|already connected to/.test(text);
  }

  function isAdbPairSuccess(output) {
    var text = String(output || "").toLowerCase();
    if (!text || isAdbOutputFailure(output)) return false;
    return /successfully paired/.test(text);
  }

  function isDeviceListed(devicesOutput, address, port) {
    var target = address + ":" + port;
    var lines = String(devicesOutput || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.indexOf("List of devices") === 0) continue;
      if (line.indexOf(target) !== 0) continue;
      if (/\boffline\b/i.test(line)) return false;
      return true;
    }
    return false;
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
      if (!pairResult.ok || !isAdbPairSuccess(pairResult.output)) {
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
    if (!connectResult.ok || !isAdbConnectSuccess(connectResult.output)) {
      return { ok: false, message: "连接失败" };
    }

    var devicesResult = runAdbStep(task, adb, ["devices", "-l"], "devices");
    if (!isDeviceListed(devicesResult.output, address, connectPort)) {
      return { ok: false, message: "连接失败：设备未出现在列表中" };
    }
    return { ok: true, message: "执行完成" };
  }

  function executeBuiltin(task, builtinKey, params) {
    var resolved = resolveAdbBin();

    if (!resolved.found) {
      pushLog(task, "error", "未找到 adb（Android platform-tools）");
      pushLog(
        task,
        "info",
        "已检查以下位置：\n" + resolved.candidates.slice(0, 12).join("\n") +
          (resolved.candidates.length > 12 ? "\n…（共 " + resolved.candidates.length + " 个）" : "")
      );
      pushLog(
        task,
        "info",
        "修复方式：1) 安装 Android SDK platform-tools；2) 把 platform-tools 加入启动服务的终端 PATH；" +
          "3) 设置 ANDROID_HOME 指向 SDK 根目录；4) 设置 SF_ADB_PATH 指向 adb 绝对路径"
      );
      return { ok: false, message: "未找到 adb：请在服务所在的机器上安装 Android platform-tools" };
    }

    var adb = resolved.bin;
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
