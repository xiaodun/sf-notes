(function () {
  const path = require("path");
  const fs = require("fs");
  const p1 = path.resolve(
    process.cwd(),
    "./data/api/project/project/delSwaggerDomain.js"
  );
  const p2 = path.resolve(
    process.cwd(),
    "./service/app/data/api/project/project/delSwaggerDomain.js"
  );
  const target = fs.existsSync(p1) ? p1 : p2;
  return eval(fs.readFileSync(target, "utf-8").toString());
})();
