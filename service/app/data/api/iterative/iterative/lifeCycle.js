(function () {
  return function () {
    const child_process = require("child_process");

    return {
      createFloder: function (createFloder, external) {
        external.execGitCommad = function (argList = [], cwd) {
          const list = [];
          for (let i = 0; i < argList.length; i++) {
            const spawn = child_process.spawnSync(
              "git",
              argList[i].split(" ").filter(Boolean),
              {
                cwd,
              }
            );

            const errorMsg = spawn.stderr.toString().trim();
            if (errorMsg) {
              list.push(errorMsg);
            }
          }

          return list;
        };
        external.getCurrentBranchName = function (cwd) {
          const spawn = child_process.spawnSync(
            "git",
            ["symbolic-ref", "--short", "HEAD"],
            {
              cwd,
            }
          );

          return spawn.stdout.toString().trim();
        };
      },
    };
  };
})();