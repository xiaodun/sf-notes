(function () {
  return function (argData, argParams) {
    const id = String(argParams.id || "").trim();
    const list = Array.isArray(argData) ? argData : [];
    const item = list.find((it) => String(it.id) === id);

    if (!item || !item.storage || !item.storage.path) {
      return {
        isWrite: false,
        response: {
          code: 200,
          data: {
            success: false,
            msg: "图片不存在",
          },
        },
      };
    }

    // 由于是模拟环境，直接返回一个默认的 base64 编码的图片
    // 实际生产环境中，这里应该从文件系统读取图片文件并转换为 base64
    const defaultBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
    const mimeType = "image/png";

    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          data: {
            content: defaultBase64,
            mimeType
          },
        },
      },
    };
  };
})();
