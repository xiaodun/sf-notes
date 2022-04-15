(function () {
  return function (argData, argParams, external) {
    const git = require("isomorphic-git");
    const fs = require("fs");
    const http = require("http");
    const iteratives = argData.iterativeList.find((item) => item.id);
    let sameNameList = [];
    argParams.projectList.forEach((project) => {
      if (iteratives.projectList.find((item) => item.name === project.name)) {
        sameNameList.push(project.name);
      }
    });
    if (sameNameList.length > 0) {
      return {
        response: {
          code: 200,
          data: {
            success: false,
            message: `${sameNameList.join(",")}已经添加`,
          },
        },
      };
    } else {
      iteratives.projectList.push(...argParams.projectList);
      const execResultList = [];
      async function batchCreateBranch() {
        for (let i = 0; i < argParams.projectList.length; i++) {
          const item = argParams.projectList[i];

          await git
            .branch({ fs, dir: item.dir, ref: item.branchName })
            .then(() => {
              execResultList.push({
                title: item.name,
                success: true,
              });
            })
            .catch((error) => {
              execResultList.push({
                title: item.name,
                success: false,
                errorMsg: error.message,
              });
            });
        }
      }

      batchCreateBranch().then(() => {
        external.response.end(
          JSON.stringify({
            success: true,
            list: execResultList,
          })
        );
      });

      return {
        async: true,
        isWrite: true,
        data: argData,
        response: {
          code: 200,
        },
      };
    }
  };
})();
