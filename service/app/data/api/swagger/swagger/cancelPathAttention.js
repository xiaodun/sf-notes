(function () {
  return function (argData, argParams, external) {
    const HTTP_METHOD_SET = new Set([
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
      "trace",
    ]);
    function parseMethodFromPathKey(pathKey) {
      if (!pathKey || typeof pathKey !== "string") {
        return "";
      }
      const idx = pathKey.indexOf(":");
      if (idx <= 0) {
        return "";
      }
      const method = pathKey.slice(0, idx).toLowerCase();
      return HTTP_METHOD_SET.has(method) ? method : "";
    }
    function identityKey(item) {
      const pathKey = item.pathKey;
      const method =
        String(item.method || parseMethodFromPathKey(pathKey) || "")
          .toLowerCase()
          .trim();
      const pathPart =
        pathKey ||
        (item.pathUrl
          ? method
            ? method + ":" + item.pathUrl
            : item.pathUrl
          : "");
      return (
        (item.domain || "") +
        "\x1e" +
        (item.groupName || "") +
        "\x1e" +
        (item.tagName || "") +
        "\x1e" +
        pathPart
      );
    }
    const deleteKeySet = new Set(
      (argParams || []).map((menuCheckbox) => identityKey(menuCheckbox || {}))
    );
    argData.attentionPathList = (argData.attentionPathList || []).filter(
      (item) => !deleteKeySet.has(identityKey(item))
    );
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
