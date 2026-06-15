(function () {
  const path = require("path");

  function resolveUploadFilePath(flag) {
    if (!flag) {
      return "";
    }
    if (path.isAbsolute(flag)) {
      return flag;
    }
    return path.join("./data/api/upload/upload", flag);
  }

  return function () {
    return {
      getDownloadFilePath: function (external, result) {
        return resolveUploadFilePath(result.file.flag);
      },
      getDeleteFilePath: function (external, result) {
        return resolveUploadFilePath(result.file.flag);
      },
    };
  };
})();
