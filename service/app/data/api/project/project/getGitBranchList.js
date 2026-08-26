(function () {
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
        timeout: 15000,
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

  function readBranch(cwd) {
    var branchResult = runGit(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
    if (!branchResult.ok) {
      return { branch: '', error: '无法读取分支' };
    }
    return { branch: branchResult.stdout.trim(), error: '' };
  }

  return function (argData, argParams) {
    var projectIds = argParams.projectIds;
    var list = argData.projectList || [];

    if (projectIds && projectIds.length) {
      var idSet = {};
      projectIds.forEach(function (id) {
        idSet[Number(id)] = true;
      });
      list = list.filter(function (p) {
        return idSet[p.id];
      });
    }

    var branches = {};
    list.forEach(function (project) {
      if (!project || !project.id) return;

      if (!project.rootPath) {
        branches[project.id] = { isRepo: false, branch: '', error: '' };
        return;
      }

      var cwd = project.rootPath;
      if (!fs.existsSync(cwd)) {
        branches[project.id] = { isRepo: false, branch: '', error: '路径不存在' };
        return;
      }

      var repoCheck = runGit(cwd, ['rev-parse', '--is-inside-work-tree']);
      if (!repoCheck.ok || repoCheck.stdout !== 'true') {
        branches[project.id] = { isRepo: false, branch: '', error: '' };
        return;
      }

      var branchInfo = readBranch(cwd);
      branches[project.id] = {
        isRepo: true,
        branch: branchInfo.branch,
        error: branchInfo.error,
      };
    });

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          branches: branches,
        },
      },
    };
  };
})();
