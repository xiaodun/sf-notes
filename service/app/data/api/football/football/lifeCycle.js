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
                  bet_id:
                    infos.list.SportteryNWDL?.bet_id ||
                    infos.list.SportteryWDL?.bet_id,
                  openVictory:
                    infos.list.SportteryNWDL?.is_single !== "0" ||
                    infos.list.SportteryWDL?.is_single !== "0",
                });
              });
            });
            callback(list);
          });
        };
        external.getSingleOddInfo = (code, bet_id, callback) => {
          let href = `
https://apic.jindianle.com/api/match/selectmore?platform=koudai_mobile&_prt=https&ver=20180101000000&serial_no=${code}&bet_id=${bet_id}

            `;

          console.log(href);

          const request = require("request");
          request(href, function (error, response, body) {
            let data = {};
            body = JSON.parse(body);
            const infos = body.data[code];
            data = {
              code: infos.serial_no,
              homeTeam: infos.host_name_s,
              visitingTeam: infos.guest_name_s,
              openVictory: infos.list.SportteryNWDL
                ? infos.list.SportteryNWDL.is_single !== "0"
                : false,
              handicapCount: +infos.list.SportteryWDL.boundary,
              oddsInfos: {
                singleVictory: {
                  win: infos.list.SportteryNWDL?.odds[3] || 0,
                  draw: infos.list.SportteryNWDL?.odds[1] || 0,
                  lose: infos.list.SportteryNWDL?.odds[0] || 0,
                },
                handicapVictory: {
                  win: infos.list.SportteryWDL.odds[3],
                  draw: infos.list.SportteryWDL.odds[1],
                  lose: infos.list.SportteryWDL.odds[0],
                },
                score: {
                  winList: [
                    ...[
                      {
                        home: 1,
                        visiting: 0,
                      },
                      {
                        home: 2,
                        visiting: 0,
                      },
                      {
                        home: 2,
                        visiting: 1,
                      },
                      {
                        home: 3,
                        visiting: 0,
                      },
                      {
                        home: 3,
                        visiting: 1,
                      },
                      {
                        home: 3,
                        visiting: 2,
                      },
                      {
                        home: 4,
                        visiting: 0,
                      },
                      {
                        home: 4,
                        visiting: 1,
                      },
                      {
                        home: 4,
                        visiting: 2,
                      },
                      {
                        home: 5,
                        visiting: 0,
                      },
                      {
                        home: 5,
                        visiting: 1,
                      },
                      {
                        home: 5,
                        visiting: 2,
                      },
                    ].map((item) => ({
                      ...item,
                      odd: infos.list.SportteryScore.odds[
                        item.home + "" + item.visiting
                      ],
                    })),
                    {
                      home: null,
                      visiting: null,
                      isOther: true,
                      otherDesc: "胜其它",
                      odd: infos.list.SportteryScore.odds["43"],
                    },
                  ],
                  drawList: [
                    ...[
                      {
                        home: 0,
                        visiting: 0,
                      },
                      {
                        home: 1,
                        visiting: 1,
                      },
                      {
                        home: 2,
                        visiting: 2,
                      },
                      {
                        home: 3,
                        visiting: 3,
                      },
                    ].map((item) => ({
                      ...item,
                      odd: infos.list.SportteryScore.odds[
                        item.home + "" + item.visiting
                      ],
                    })),
                    {
                      home: null,
                      visiting: null,
                      isOther: true,
                      otherDesc: "平其他",
                      odd: infos.list.SportteryScore.odds["44"],
                    },
                  ],
                  loseList: [
                    ...[
                      {
                        home: 0,
                        visiting: 1,
                      },
                      {
                        home: 0,
                        visiting: 2,
                      },
                      {
                        home: 1,
                        visiting: 2,
                      },
                      {
                        home: 0,
                        visiting: 3,
                      },
                      {
                        home: 1,
                        visiting: 3,
                      },
                      {
                        home: 2,
                        visiting: 3,
                      },
                      {
                        home: 0,
                        visiting: 4,
                      },
                      {
                        home: 1,
                        visiting: 4,
                      },
                      {
                        home: 2,
                        visiting: 4,
                      },
                      {
                        home: 0,
                        visiting: 5,
                      },
                      {
                        home: 1,
                        visiting: 5,
                      },
                      {
                        home: 2,
                        visiting: 5,
                      },
                    ].map((item) => ({
                      ...item,
                      odd: infos.list.SportteryScore.odds[
                        item.home + "" + item.visiting
                      ],
                    })),
                    {
                      home: null,
                      visiting: null,
                      isOther: true,
                      otherDesc: "负其它",
                      odd: infos.list.SportteryScore.odds["34"],
                    },
                  ],
                },
                goalList: [
                  {
                    count: 0,
                    desc: "0球",
                    odd: infos.list.SportteryTotalGoals.odds[0],
                  },
                  {
                    count: 1,
                    desc: "1球",
                    odd: infos.list.SportteryTotalGoals.odds[1],
                  },
                  {
                    count: 2,
                    desc: "2球",
                    odd: infos.list.SportteryTotalGoals.odds[2],
                  },
                  {
                    count: 3,
                    desc: "3球",
                    odd: infos.list.SportteryTotalGoals.odds[3],
                  },
                  {
                    count: 4,
                    desc: "4球",
                    odd: infos.list.SportteryTotalGoals.odds[4],
                  },
                  {
                    count: 5,
                    desc: "5球",
                    odd: infos.list.SportteryTotalGoals.odds[5],
                  },
                  {
                    count: 6,
                    desc: "6球",
                    odd: infos.list.SportteryTotalGoals.odds[6],
                  },
                  {
                    count: null,
                    desc: "7+",
                    isOther: true,
                    odd: infos.list.SportteryTotalGoals.odds[7],
                  },
                ],
                halfVictoryList: [
                  {
                    home: "胜",
                    visiting: "胜",
                    odd: infos.list.SportteryHalfFull.odds["33"],
                  },
                  {
                    home: "胜",
                    visiting: "平",
                    odd: infos.list.SportteryHalfFull.odds["31"],
                  },
                  {
                    home: "胜",
                    visiting: "负",
                    odd: infos.list.SportteryHalfFull.odds["30"],
                  },
                  {
                    home: "平",
                    visiting: "胜",
                    odd: infos.list.SportteryHalfFull.odds["13"],
                  },
                  {
                    home: "平",
                    visiting: "平",
                    odd: infos.list.SportteryHalfFull.odds["11"],
                  },
                  {
                    home: "平",
                    visiting: "负",
                    odd: infos.list.SportteryHalfFull.odds["10"],
                  },
                  {
                    home: "负",
                    visiting: "胜",
                    odd: infos.list.SportteryHalfFull.odds["03"],
                  },
                  {
                    home: "负",
                    visiting: "平",
                    odd: infos.list.SportteryHalfFull.odds["01"],
                  },
                  {
                    home: "负",
                    visiting: "负",
                    odd: infos.list.SportteryHalfFull.odds["00"],
                  },
                ],
              },
            };
            callback(data);
          });
        };
      },
    };
  };
})();
