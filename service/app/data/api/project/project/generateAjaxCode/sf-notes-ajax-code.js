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
            get: "get",
          };

          return `
                      {
                        name:"${pathName}",
                        url:"${url}",
                        method:"${methodTransform[item.data.method]}",
                        desc:"${item.data.summary}"
                      }`;
        })
        .join(",\n") + ",\n";
    ajaxCodeWrapList.push(pathStatement);
    return ajaxCodeWrapList;
  };
})();
