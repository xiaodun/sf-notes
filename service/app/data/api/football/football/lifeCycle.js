(function () {
  return function () {
    const fs = require("fs");
    const path = require("path");
    const rootPath = "./data/api/football/football";
    return {
      createFloder: function (createFloder, external) {
        external.getPredictDataFolderPath = (id) => {
          return path.join(rootPath, id + "");
        };
        external.getNoStartGameList = (callback) => {
          let href =
            "https://apic.jindianle.com/api/match/selectlist?platform=koudai_mobile&_prt=https&ver=20180101000000&hide_more=1";

          const request = require("request");
          request(href, function (error, response, body) {
            let list = [];
            body = JSON.parse(body);
            Object.keys(body.data).forEach((dateKey) => {
              Object.keys(body.data[dateKey]).forEach((codeKey) => {
                const infos = body.data[dateKey][codeKey];
                list.push({
                  date: infos.bet_time,
                  homeTeam: infos.host_name_s,
                  visitingTeam: infos.guest_name_s,
                  code: infos.serial_no,
                });
              });
            });
            callback(list);
          });
        };
      },
    };
  };
})();
