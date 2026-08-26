;(function () {
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
          stdout: stdout,
          stderr: stderr,
          output: (result.error.message || stderr || stdout).trim(),
        };
      }
      return {
        ok: result.status === 0,
        stdout: stdout,
        stderr: stderr,
        output: (stdout + '\n' + stderr).trim(),
      };
    } catch (e) {
      return {
        ok: false,
        stdout: '',
        stderr: String(e.message || e),
        output: String(e.message || e),
      };
    }
  }

  function firstLine(text) {
    if (!text) return '';
    var line = String(text)
      .split('\n')
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean)[0];
    return line || String(text).trim();
  }

  function isDirty(cwd) {
    var statusResult = runGit(cwd, ['status', '--porcelain']);
    return !!(statusResult.stdout && statusResult.stdout.trim());
  }

  function readCurrentBranch(cwd) {
    var branchResult = runGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
    return branchResult.ok ? branchResult.stdout.trim() : '';
  }

  function hasConflict(cwd, result) {
    if (!result) return false;
    var text = (result.output || '').toLowerCase();
    if (
      text.indexOf('conflict') !== -1 ||
      text.indexOf('unmerged paths') !== -1 ||
      text.indexOf('needs merge') !== -1
    ) {
      return true;
    }
    if (fs.existsSync(path.join(cwd, '.git', 'MERGE_HEAD'))) return true;
    var unmerged = runGit(cwd, ['diff', '--name-only', '--diff-filter=U']);
    return !!(unmerged.stdout && unmerged.stdout.trim());
  }

  function checkoutBranch(cwd, branch) {
    // 优先 switch，老环境回退 checkout；绝不带 --force / -f
    var sw = runGit(cwd, ['switch', branch]);
    if (sw.ok) return sw;
    return runGit(cwd, ['checkout', branch]);
  }

  return function (argData, argParams) {
    var startTime = Date.now();
    var steps = [];
    var projectId = Number(argParams.projectId);
    var targetBranch = String(argParams.branch || '').trim();
    // carry: 带到目标分支；stash: 改动进 stash 后切换；空: 有脏文件时先询问
    var dirtyStrategy = String(argParams.dirtyStrategy || '').trim();

    function step(actionName, result) {
      steps.push({
        action: actionName,
        ok: !!(result && result.ok),
        output: (result && (result.output || result.stderr || result.stdout)) || '',
      });
      return result;
    }

    function respond(payload) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: Object.assign(
              {
                steps: steps,
                elapsed: Date.now() - startTime,
              },
              payload,
              {
                branch:
                  payload.branch != null
                    ? payload.branch
                    : cwd
                      ? readCurrentBranch(cwd)
                      : '',
              }
            ),
          },
        },
      };
    }

    var project = (argData.projectList || []).find(function (p) {
      return p.id === projectId;
    });

    if (!project) {
      return respond({ status: 'failed', message: '项目不存在', branch: '' });
    }

    var cwd = project.rootPath;
    if (!cwd || !fs.existsSync(cwd)) {
      return respond({
        status: 'failed',
        message: '项目路径不存在：' + cwd,
        rootPath: cwd,
      });
    }

    if (!targetBranch) {
      return respond({ status: 'failed', message: '未指定目标分支' });
    }

    var repoCheck = step(
      'check_repo',
      runGit(cwd, ['rev-parse', '--is-inside-work-tree'])
    );
    if (!repoCheck.ok || repoCheck.stdout !== 'true') {
      return respond({ status: 'failed', message: '不是 Git 仓库' });
    }

    var current = readCurrentBranch(cwd);
    if (current === targetBranch) {
      return respond({
        status: 'success',
        message: '已在目标分支',
        branch: current,
      });
    }

    // 校验本地分支存在
    var localList = runGit(cwd, [
      'for-each-ref',
      '--format=%(refname:short)',
      'refs/heads',
    ]);
    var locals = (localList.stdout || '')
      .split(/\r?\n/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    if (locals.indexOf(targetBranch) === -1) {
      return respond({
        status: 'failed',
        message: '本地不存在分支：' + targetBranch,
        branch: current,
      });
    }

    var dirty = isDirty(cwd);

    if (dirty && dirtyStrategy !== 'carry' && dirtyStrategy !== 'stash') {
      return respond({
        status: 'need_strategy',
        message: '有未提交更改，请选择如何处理',
        isDirty: true,
        branch: current,
        targetBranch: targetBranch,
      });
    }

    function restoreStash() {
      return step('stash_pop_restore', runGit(cwd, ['stash', 'pop']));
    }

    if (!dirty) {
      var cleanCheckout = step('checkout', checkoutBranch(cwd, targetBranch));
      if (!cleanCheckout.ok) {
        return respond({
          status: 'failed',
          message: firstLine(cleanCheckout.output) || '切换分支失败',
          branch: readCurrentBranch(cwd),
        });
      }
      return respond({
        status: 'success',
        message: '已切换到 ' + targetBranch,
        branch: readCurrentBranch(cwd),
      });
    }

    if (dirtyStrategy === 'carry') {
      // 先直接切换（无冲突时可带着未提交改动）
      var direct = step('checkout_carry', checkoutBranch(cwd, targetBranch));
      if (direct.ok) {
        return respond({
          status: 'success',
          message: '已带着未提交更改切换到 ' + targetBranch,
          branch: readCurrentBranch(cwd),
        });
      }

      // 无法直接带着走：stash → checkout → pop（绝不 drop）
      var stashCarry = step(
        'stash',
        runGit(cwd, ['stash', 'push', '-u', '-m', 'sf-notes:switch-carry'])
      );
      if (!stashCarry.ok) {
        return respond({
          status: 'failed',
          message: '暂存未提交更改失败：' + firstLine(stashCarry.output),
          branch: readCurrentBranch(cwd),
        });
      }

      var afterStashCheckout = step(
        'checkout',
        checkoutBranch(cwd, targetBranch)
      );
      if (!afterStashCheckout.ok) {
        restoreStash();
        return respond({
          status: 'failed',
          message:
            '切换失败，已尝试恢复未提交更改：' +
            firstLine(afterStashCheckout.output),
          branch: readCurrentBranch(cwd),
        });
      }

      var popCarry = step('stash_pop', runGit(cwd, ['stash', 'pop']));
      if (!popCarry.ok || hasConflict(cwd, popCarry)) {
        return respond({
          status: 'conflict',
          message:
            '已切换到 ' +
            targetBranch +
            '，恢复未提交更改时有冲突，请手动处理（改动未丢弃）',
          branch: readCurrentBranch(cwd),
        });
      }

      return respond({
        status: 'success',
        message: '已带着未提交更改切换到 ' + targetBranch,
        branch: readCurrentBranch(cwd),
      });
    }

    // dirtyStrategy === 'stash'：改动放入 stash 保留，再切换
    var stashOnly = step(
      'stash',
      runGit(cwd, ['stash', 'push', '-u', '-m', 'sf-notes:switch-keep'])
    );
    if (!stashOnly.ok) {
      return respond({
        status: 'failed',
        message: '保留未提交更改失败：' + firstLine(stashOnly.output),
        branch: readCurrentBranch(cwd),
      });
    }

    var stashCheckout = step('checkout', checkoutBranch(cwd, targetBranch));
    if (!stashCheckout.ok) {
      restoreStash();
      return respond({
        status: 'failed',
        message:
          '切换失败，已恢复未提交更改到工作区：' +
          firstLine(stashCheckout.output),
        branch: readCurrentBranch(cwd),
      });
    }

    return respond({
      status: 'success',
      message:
        '已切换到 ' +
        targetBranch +
        '，未提交更改已保留在 stash（可用 git stash pop 取回）',
      branch: readCurrentBranch(cwd),
      stashed: true,
    });
  };
})();
