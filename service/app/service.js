var Service = require("sf-inner-service");
var file_os = require("fs");
let config = JSON.parse(file_os.readFileSync("config.json", "utf-8"));
console.log("sf-pc-web");
Service.start(config);
