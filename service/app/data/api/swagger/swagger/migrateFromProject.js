(function () {
  return function (argData) {
    const fs = require("fs");
    const path = require("path");
    const dataApiRootCandidates = [
      path.resolve(process.cwd(), "./data/api"),
      path.resolve(process.cwd(), "./service/app/data/api"),
    ];
    const dataApiRoot =
      dataApiRootCandidates.find((p) => fs.existsSync(p)) ||
      dataApiRootCandidates[0];
    if (argData._migratedFromProjectOnce) {
      return false;
    }
    const projectDataPath = path.join(
      dataApiRoot,
      "project/project/project.json"
    );
    if (!fs.existsSync(projectDataPath)) {
      argData._migratedFromProjectOnce = Date.now();
      return true;
    }
    let projectData = {};
    try {
      projectData = JSON.parse(fs.readFileSync(projectDataPath).toString());
    } catch (error) {
      return false;
    }
    const oldConfig = projectData.config || {};
    const newConfig = argData.config || {};
    argData.config = {
      showEnumList:
        newConfig.showEnumList !== undefined
          ? newConfig.showEnumList
          : !!oldConfig.showEnumList,
      swaggerPathShowWay:
        newConfig.swaggerPathShowWay ||
        oldConfig.swaggerPathShowWay ||
        "path",
      lastOptionSwaggerDomain:
        newConfig.lastOptionSwaggerDomain || oldConfig.lastOptionSwaggerDomain || "",
    };
    if (!argData.swaggerList?.length && Array.isArray(projectData.swaggerList)) {
      argData.swaggerList = projectData.swaggerList;
    }
    if (
      (!argData.attentionPathList || !argData.attentionPathList.length) &&
      Array.isArray(projectData.attentionPathList)
    ) {
      argData.attentionPathList = projectData.attentionPathList;
    }
    if (
      (!argData.inExcludeGroups || !Object.keys(argData.inExcludeGroups).length) &&
      projectData.inExcludeGroups &&
      typeof projectData.inExcludeGroups === "object"
    ) {
      argData.inExcludeGroups = projectData.inExcludeGroups;
    }
    if (
      (!argData.apiPrefixs || !Object.keys(argData.apiPrefixs).length) &&
      projectData.apiPrefixs &&
      typeof projectData.apiPrefixs === "object"
    ) {
      argData.apiPrefixs = projectData.apiPrefixs;
    }

    const oldSwaggerFolder = path.join(dataApiRoot, "project/project/swagger");
    const newSwaggerFolder = path.join(dataApiRoot, "swagger/swagger/docs");
    if (!fs.existsSync(newSwaggerFolder)) {
      fs.mkdirSync(newSwaggerFolder, { recursive: true });
    }
    (argData.swaggerList || []).forEach((item) => {
      const fileName = `${item.id}.json`;
      const oldPath = path.join(oldSwaggerFolder, fileName);
      const newPath = path.join(newSwaggerFolder, fileName);
      if (fs.existsSync(oldPath) && !fs.existsSync(newPath)) {
        fs.copyFileSync(oldPath, newPath);
      }
    });

    delete projectData.inExcludeGroups;
    delete projectData.swaggerList;
    delete projectData.apiPrefixs;
    delete projectData.attentionPathList;
    if (projectData.config && typeof projectData.config === "object") {
      delete projectData.config.showEnumList;
      delete projectData.config.swaggerPathShowWay;
      delete projectData.config.lastOptionSwaggerDomain;
    }
    fs.writeFileSync(projectDataPath, JSON.stringify(projectData, null, 2));

    argData._migratedFromProjectOnce = Date.now();
    return true;
  };
})();
