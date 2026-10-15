(function () {
  return function (argData, argParams) {
    //数据文件缺失/为空时框架传入 null，补成规范空值，避免 TypeError
    argData = argData || { config: {}, inExcludeGroups: {}, swaggerList: [], apiPrefixs: {}, attentionPathList: [] };
    const fs = require("fs");
    const path = require("path");
    const p1 = path.resolve(
      process.cwd(),
      "./data/api/swagger/swagger/migrateFromProject.js"
    );
    const p2 = path.resolve(
      process.cwd(),
      "./service/app/data/api/swagger/swagger/migrateFromProject.js"
    );
    const target = fs.existsSync(p1) ? p1 : p2;
    if (!fs.existsSync(target)) {
      throw new Error(
        "migrateFromProject.js not found:\n" + [p1, p2].join("\n")
      );
    }
    const migrated = eval(fs.readFileSync(target, "utf-8").toString())(argData);
    return {
      isWrite: !!migrated,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          data: argData.config,
        },
      },
    };
  };
})();
