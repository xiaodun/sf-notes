;(function () {
  var spawnSync = require('child_process').spawnSync;
  var fs = require('fs');

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
        timeout: 20000,
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

  return function (argData, argParams) {
    var projectId = Number(argParams.projectId);
    var project = (argData.projectList || []).find(function (p) {
      return p.id === projectId;
    });

    function fail(message) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: true,
            result: {
              status: 'failed',
              message: message,
              current: '',
              branches: [],
              isDirty: false,
            },
          },
        },
      };
    }

    if (!project) return fail('项目不存在');
    var cwd = project.rootPath;
    if (!cwd || !fs.existsSync(cwd)) return fail('项目路径不存在');

    var repoCheck = runGit(cwd, ['rev-parse', '--is-inside-work-tree']);
    if (!repoCheck.ok || repoCheck.stdout !== 'true') {
      return fail('不是 Git 仓库');
    }

    var currentResult = runGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
    var current = currentResult.ok ? currentResult.stdout.trim() : '';

    var listResult = runGit(cwd, [
      'for-each-ref',
      '--sort=-committerdate',
      '--format=%(refname:short)',
      'refs/heads',
    ]);
    var branches = [];
    if (listResult.ok && listResult.stdout) {
      branches = listResult.stdout
        .split(/\r?\n/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }
    // 当前分支置顶，其余保持按最近提交活跃度
    if (current) {
      branches = [current].concat(
        branches.filter(function (b) {
          return b !== current;
        })
      );
    }

    var statusResult = runGit(cwd, ['status', '--porcelain']);
    var isDirty = !!(statusResult.stdout && statusResult.stdout.trim());

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          result: {
            status: 'success',
            current: current,
            branches: branches,
            isDirty: isDirty,
            message: listResult.ok ? '' : firstLine(listResult.output) || '读取分支失败',
          },
        },
      },
    };
  };
})();
