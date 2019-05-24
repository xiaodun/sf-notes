var Service = require("sf-inner-service");
var file_os = require("fs");
var a = 10;
let config = JSON.parse(file_os.readFileSync("config.json", "utf-8"));
console.log("sf-pc-web");
Service.start(config);
