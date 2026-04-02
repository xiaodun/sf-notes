const fs = require("fs");
(function () {
  return function (argData, argParams, external) {
    const novelPath = argParams.path;
    const chapter = parseInt(argParams.chapter, 10);

    if (!novelPath || !fs.existsSync(novelPath)) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "路径不存在" } },
      };
    }
    if (!chapter || chapter < 1) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "章节号无效" } },
      };
    }

    try {
      const store = external.loadChapterMarkStore();
      const existed = external.deleteChapterMarkByNovel(store, novelPath, chapter);
      external.saveChapterMarkStore(store);
      return {
        isWrite: false,
        response: { code: 200, data: { success: true, data: { cleared: existed } } },
      };
    } catch (error) {
      return {
        isWrite: false,
        response: { code: 200, data: { success: false, msg: "清空标记失败: " + error.message } },
      };
    }
  };
})();
