(function () {
  var spawnSync = require('child_process').spawnSync;
  var fs = require('fs');
  var path = require('path');

  var GIT_TIMEOUT = 45000;

  function resolveGitBin() {
    if (process.platform === 'win32') {
      var candidates = [
        'C:\\Program Files\\Git\\cmd\\git.exe',
        'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
      ];
      for (var i = 0; i < candidates.length; i++) {
        if (fs.existsSync(candidates[i])) {
          return candidates[i];
        }
      }
    }
    return 'git';
  }

  var GIT_BIN = resolveGitBin();

  function runGit(cwd, args) {
    try {
      var result = spawnSync(GIT_BIN, args, {
        cwd: cwd,
        encoding: 'utf-8',
        timeout: GIT_TIMEOUT,
        windowsHide: true,
        env: Object.assign({}, process.env, {
          GIT_TERMINAL_PROMPT: '0',
          GCM_INTERACTIVE: 'Never',
        }),
      });
      var stdout = (result.stdout || '').trim();
      var stderr = (result.stderr || '').trim();
      if (result.error) {
        return {
          ok: false,
          exitCode: result.status,
          stdout: stdout,
          stderr: stderr,
          output: (result.error.message || stderr || stdout).trim(),
        };
      }
      return {
        ok: result.status === 0,
        exitCode: result.status,
        stdout: stdout,
        stderr: stderr,
        output: (stdout + '\n' + stderr).trim(),
      };
    } catch (e) {
      return {
        ok: false,
        exitCode: -1,
        stdout: '',
        stderr: String(e.message || e),
        output: String(e.message || e),
      };
    }
  }

  function isConflictText(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    return (
      lower.indexOf('conflict') !== -1 ||
      lower.indexOf('merge conflict') !== -1 ||
      lower.indexOf('unmerged paths') !== -1 ||
      lower.indexOf('needs merge') !== -1
    );
  }

  function hasMergeHead(cwd) {
    return fs.existsSync(path.join(cwd, '.git', 'MERGE_HEAD'));
  }

  function hasUnmergedFiles(cwd) {
    var r = runGit(cwd, ['diff', '--name-only', '--diff-filter=U']);
    return !!(r.stdout && r.stdout.trim());
  }

  function isConflictState(cwd, result) {
    return isConflictText(result.output) || hasMergeHead(cwd) || hasUnmergedFiles(cwd);
  }

  function firstLine(text) {
    if (!text) return '';
    var line = String(text).split('\n').map(function (s) { return s.trim(); }).filter(Boolean)[0];
    return line || String(text).trim();
  }

  function isAuthError(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    return (
      lower.indexOf('authentication failed') !== -1 ||
      lower.indexOf('could not read username') !== -1 ||
      lower.indexOf('invalid username or token') !== -1 ||
      lower.indexOf('access denied') !== -1 ||
      lower.indexOf('permission denied (publickey)') !== -1 ||
      lower.indexOf('terminal prompts disabled') !== -1 ||
      lower.indexOf('support for password authentication was removed') !== -1 ||
      /\b401\b/.test(lower) ||
      /\b403\b/.test(lower)
    );
  }

  function isNetworkError(text) {
    if (!text) return false;
    var lower = text.toLowerCase();
    return (
      lower.indexOf('connection was reset') !== -1 ||
      lower.indexOf('connection timed out') !== -1 ||
      lower.indexOf('failed to connect') !== -1 ||
      lower.indexOf('recv failure') !== -1 ||
      lower.indexOf('could not resolve host') !== -1 ||
      lower.indexOf('network is unreachable') !== -1
    );
  }

  function formatPullError(raw) {
    if (isAuthError(raw)) {
      return 'Git 未登录或无权限。GitHub Desktop 的登录与系统 Git 不共用，请在终端进入项目目录执行 git pull 完成登录（或改用 SSH 地址）';
    }
    if (isNetworkError(raw)) {
      var line = firstLine(raw) || '网络连接失败';
      return line + '（可稍后重试；若 GitHub Desktop 正常而此处失败，也可能是系统 Git 未登录）';
    }
    return firstLine(raw) || 'pull 失败';
  }

  function pullOnce(cwd) {
    return runGit(cwd, ['pull', '--no-edit']);
  }

  function pullWithRetry(cwd) {
    var result = pullOnce(cwd);
    if (result.ok || isConflictState(cwd, result)) {
      return result;
    }
    // 网络等非冲突错误，重试一次
    return pullOnce(cwd);
  }

  return function (argData, argParams) {
    var startTime = Date.now();
    var steps = [];
    var projectId = Number(argParams.projectId);
    var action = argParams.action || 'pull';

    function step(actionName, result) {
      steps.push({
        action: actionName,
        ok: result.ok,
        output: result.output || result.stderr || result.stdout || '',
      });
      return result;
    }

    var project = (argData.projectList || []).find(function (p) {
      return p.id === projectId;
    });

    if (!project) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'failed',
              message: '项目不存在',
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    var cwd = project.rootPath;
    if (!cwd || !fs.existsSync(cwd)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'failed',
              message: '项目路径不存在：' + cwd,
              rootPath: cwd,
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    // 检查是否为 git 仓库
    var repoCheck = step('check_repo', runGit(cwd, ['rev-parse', '--is-inside-work-tree']));
    if (!repoCheck.ok || repoCheck.stdout !== 'true') {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'failed',
              message: '不是 Git 仓库',
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    if (action !== 'pull') {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'failed',
              message: '暂不支持该操作',
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    // 检查工作区是否干净
    var statusResult = step('status', runGit(cwd, ['status', '--porcelain']));
    var isDirty = !!(statusResult.stdout && statusResult.stdout.trim());
    var didStash = false;

    if (isDirty) {
      var stashResult = step(
        'stash',
        runGit(cwd, ['stash', 'push', '-m', 'sf-notes:auto'])
      );
      if (!stashResult.ok) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: true,
              result: {
                status: 'failed',
                message: 'stash 失败：' + (stashResult.stderr || stashResult.stdout),
                steps: steps,
                elapsed: Date.now() - startTime,
              },
            },
          },
        };
      }
      didStash = true;
    }

    // pull（merge 模式，默认）
    var pullResult = step('pull', pullWithRetry(cwd));

    if (isConflictState(cwd, pullResult)) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'conflict',
              message: didStash
                ? 'pull 冲突，改动已保留在 stash 中，请手动解决'
                : 'pull 存在合并冲突，请手动解决',
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    if (!pullResult.ok) {
      var rawErr = pullResult.stderr || pullResult.stdout || pullResult.output || '';
      var errMsg = formatPullError(rawErr);
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'failed',
              message: errMsg,
              errorKind: isAuthError(rawErr) ? 'auth' : isNetworkError(rawErr) ? 'network' : 'other',
              rootPath: cwd,
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    // pull 成功，恢复 stash
    if (didStash) {
      var popResult = step('stash_pop', runGit(cwd, ['stash', 'pop']));
      if (!popResult.ok || isConflictState(cwd, popResult)) {
        return {
          isWrite: false,
          response: {
            code: 200,
            data: {
              success: true,
              result: {
                status: 'conflict',
                message: 'pull 成功，但恢复 stash 时冲突，请手动解决',
                steps: steps,
                elapsed: Date.now() - startTime,
              },
            },
          },
        };
      }
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'stashed_success',
              message: '已 stash → pull → 恢复，全部成功',
              steps: steps,
              elapsed: Date.now() - startTime,
            },
          },
        },
      };
    }

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          result: {
            status: 'success',
            message: pullResult.stdout || '拉取成功',
            steps: steps,
            elapsed: Date.now() - startTime,
          },
        },
      },
    };
  };
})();
