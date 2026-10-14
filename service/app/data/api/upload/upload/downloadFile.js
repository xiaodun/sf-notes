(function () {
  const file_os = require("fs");
  const path = require("path");

  // 与 lifeCycle.getDownloadFilePath 保持同一套落盘路径规则。
  function resolveUploadFilePath(flag) {
    if (!flag) {
      return "";
    }
    if (path.isAbsolute(flag)) {
      return flag;
    }
    return path.join("./data/api/upload/upload", flag);
  }

  return function (argData, argParams, argEnv) {
    let id = argParams.id;
    let file = "";
    argData.some((el, index, arr) => {
      if (el.id === id) {
        file = {
          flag: el.flag,
          name: el.name,
          type: el.type,
        };
        return true;
      }
    });
    if (!file) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "文件已被删除",
          },
        },
      };
    }
    // 记录还在、文件丢了（历史示例数据或手工删过文件）时直接回提示：
    // 框架那段下载是 file_os.ReadStream(path).pipe(response)，没有 error 监听，
    // 缺文件会抛 ENOENT 把整个服务进程带崩。
    if (!file_os.existsSync(resolveUploadFilePath(file.flag))) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            message: "文件已丢失，请删除这条记录",
          },
        },
      };
    }
    return {
      isWrite: false,
      isDownload: true,
      file,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
