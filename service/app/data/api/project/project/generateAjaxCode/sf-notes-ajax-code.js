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
          let prefix = external.getPathPrefix(item, apiPrefixs);
          let url = prefix + item.pathUrl;
          let methodTransform = {
            post: "postJSON",
            put: "putJSON",
            patch: "patchJSON",
            delete: "delete",
            get: "get",
          };
          const m = String(item.data.method || "get").toLowerCase();
          const ajaxMethod = methodTransform[m] || m;

          return `
                      {
                        name:"${pathName}",
                        url:"${url}",
                        method:"${ajaxMethod}",
                        desc:"${item.data.summary}"
                      }`;
        })
        .join(",\n") + ",\n";
    ajaxCodeWrapList.push(pathStatement);
    return ajaxCodeWrapList;
  };
})();
