(function () {
  return function (checkedPathList, apiPrefixs, external) {
    let ajaxCodeWrapList = [];
    let pathStatement = {
      name: "路径声明",
    };
    pathStatement.data =
      checkedPathList
        .map((item) => {
          let pathName = external.getPathName(item.pathUrl, true);
          return `${pathName}:"${prefix}${item.pathUrl}"`;
        })
        .join(",\n") + ",\n";
    let methodStatement = {
      name: "方法声明",
    };
    methodStatement.data =
      checkedPathList
        .map((item) => {
          let pathName = external.getPathName(item.pathUrl, true);
          return `${pathName}:function (data, callback) {
          let url = healthInterfaces.likeOperation;
        return request.${item.data.method}(url, data, callback);
      }`;
        })
        .join(",\n") + ",\n";

    ajaxCodeWrapList.push(pathStatement, methodStatement);
    return ajaxCodeWrapList;
  };
})();
