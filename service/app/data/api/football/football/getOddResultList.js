(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    const path = require("path");
    const predictInfo = argData.predictList.find(
      (item) => item.id == argParams.id
    );
    const teamOddlist = [];
    predictInfo.teamOddList
      .map((item) => {
        const teamOddFilePath = path.join(
          external.getPredictDataFolderPath(argParams.id),
          item + ".json"
        );
        return JSON.parse(fs.readFileSync(teamOddFilePath));
      })
      .forEach((item) => {
        let list = [];
        const { oddsInfos, ...restParams } = item;
        let data = {
          ...restParams,
        };

        list.push({
          ...data,
          odd: oddsInfos.singleVictory.win,
          allowSingle: item.openVictory,
          resultDesc: `${data.homeTeam} 胜 ${data.visitingTeam} @${oddsInfos.singleVictory.win}`,
        });
        list.push({
          ...data,
          allowSingle: item.openVictory,
          odd: oddsInfos.singleVictory.draw,
          resultDesc: `${data.homeTeam} 平 ${data.visitingTeam} @${oddsInfos.singleVictory.draw}`,
        });
        list.push({
          ...data,
          odd: oddsInfos.singleVictory.lose,
          allowSingle: item.openVictory,
          resultDesc: `${data.homeTeam} 负 ${data.visitingTeam} @${oddsInfos.singleVictory.lose}`,
        });

        let handicapDesc;
        if (item.isLet) {
          handicapDesc = "让" + item.handicapCount + "球";
        } else {
          handicapDesc = "受让" + item.handicapCount + "球";
        }

        list.push({
          ...data,
          allowSingle: false,
          odd: oddsInfos.handicapVictory.win,
          resultDesc: `${data.homeTeam} ${handicapDesc} 胜 ${data.visitingTeam} @${oddsInfos.handicapVictory.win}`,
        });
        list.push({
          ...data,
          allowSingle: false,
          odd: oddsInfos.handicapVictory.draw,
          resultDesc: `${data.homeTeam} ${handicapDesc} 平 ${data.visitingTeam} @${oddsInfos.handicapVictory.draw}`,
        });
        list.push({
          ...data,
          allowSingle: false,
          odd: oddsInfos.handicapVictory.lose,
          resultDesc: `${data.homeTeam} ${handicapDesc} 负 ${data.visitingTeam} @${oddsInfos.handicapVictory.lose}`,
        });
        [
          ...oddsInfos.score.winList,
          ...oddsInfos.score.drawList,
          ...oddsInfos.score.loseList,
        ].forEach((el) => {
          list.push({
            ...data,
            odd: el.odd,
            resultDesc: el.isOther
              ? `${data.homeTeam} ${el.otherDesc} ${data.visitingTeam} @${el.odd}`
              : `${data.homeTeam} ${el.home}:${el.visiting} ${data.visitingTeam} @${el.odd}`,
          });
        });
        oddsInfos.goalList.forEach((el) => {
          list.push({
            ...data,
            odd: el.odd,
            resultDesc: `${data.homeTeam} 进${el.desc} ${data.visitingTeam} @${el.odd}`,
          });
        });
        oddsInfos.halfVictoryList.forEach((el) => {
          list.push({
            ...data,
            odd: el.odd,
            resultDesc: `${data.homeTeam} ${el.home}/${el.visiting} ${data.visitingTeam} @${el.odd}`,
          });
        });
        teamOddlist.push(list);
      });
    let oddResultList = [];
    let teamCombinationList = [];
    getTeamCombinationList(0);
    function getTeamCombinationList(index) {
      const list = [];
      teamCombinationList.forEach((el) => {
        list.push([...el, teamOddlist[index]]);
      });
      list.push([teamOddlist[index]]);
      teamCombinationList = [...teamCombinationList, ...list];
      if (index < teamOddlist.length - 1) {
        getTeamCombinationList(index + 1);
      }
    }

    let base = 10;
    teamCombinationList.forEach((list) => {
      console.log(list.length);
    });
    for (let i = 0; i < teamCombinationList.length; i++) {
      const list = teamCombinationList[i];
      console.log(list.length);

      if (list.length === 1) {
        list[0].forEach((item) => {
          if (item.allowSingle !== false) {
            oddResultList.push({
              list: [item],
              base,
              count: item.odd * base,
            });
          }
        });
      } else {
        againForEach([], 0);
        function againForEach(againList, index) {
          list[index].forEach((el) => {
            if (index === list.length - 1) {
              let data = { list: [], base: 10, count: 10 };
              [...againList, el].forEach((item) => {
                data.list.push(item.resultDesc);
                data.count *= item.odd;
              });
              oddResultList.push(data);
            } else {
              againForEach([...againList, el], index + 1);
            }
          });
        }
      }
      console.log("end", teamCombinationList.length);
    }
    console.log("sort preview", teamCombinationList.length);

    // oddResultList.sort((a, b) => a.count - b.count);
    let data = JSON.stringify(oddResultList);
    console.log("sort end", teamCombinationList.length);
    return {
      response: {
        code: 200,
        data: {
          success: true,
          list: oddResultList,
        },
      },
    };
  };
})();
