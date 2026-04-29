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
    function sanitize(item) {
      const method =
        String(item.method || parseMethodFromPathKey(item.pathKey) || "")
          .toLowerCase()
          .trim() || undefined;
      return {
        domain: item.domain,
        groupName: item.groupName,
        tagName: item.tagName,
        pathKey: item.pathKey,
        pathUrl: item.pathUrl,
        method,
        isPath: true,
      };
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

    const existedKeySet = new Set(
      (argData.attentionPathList || []).map((item) => identityKey(item))
    );
    argParams.forEach((menuCheckbox) => {
      const normalized = sanitize(menuCheckbox || {});
      const key = identityKey(normalized);
      if (!key || existedKeySet.has(key)) {
        return;
      }
      argData.attentionPathList.push(normalized);
      existedKeySet.add(key);
    });
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
