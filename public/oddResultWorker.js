function fixedWidth(char) {
  return `<span style="width:80px;display:inline-block">${char}</span>`;
}

function calculateOddResultList(argTeamOddList) {
  const teamResultOddList = [];
  argTeamOddList.forEach((item) => {
    const { oddsInfos, ...restParams } = item;
    const data = {
      ...restParams,
    };
    const list = [];
    list.push({
      ...data,
      odd: oddsInfos.singleVictory.win,
      allowSingle: item.openVictory,
      resultDesc: `${fixedWidth('胜')}@${oddsInfos.singleVictory.win}  ${
        data.homeTeam
      } vs ${data.visitingTeam}`,
      codeDesc: `${data.code} 胜`,
    });
    list.push({
      ...data,
      allowSingle: item.openVictory,
      odd: oddsInfos.singleVictory.draw,
      resultDesc: `${fixedWidth('平')}@${oddsInfos.singleVictory.draw}  ${
        data.homeTeam
      } vs  ${data.visitingTeam}`,
      codeDesc: `${data.code} 平`,
    });
    list.push({
      ...data,
      odd: oddsInfos.singleVictory.lose,
      allowSingle: item.openVictory,
      resultDesc: `${fixedWidth('负')}@${oddsInfos.singleVictory.lose}  ${
        data.homeTeam
      }  vs ${data.visitingTeam} `,
      codeDesc: `${data.code} 负`,
    });

    let handicapDesc = '';
    if (item.handicapCount < 0) {
      handicapDesc = '让' + Math.abs(item.handicapCount) + '球';
    } else {
      handicapDesc = '受让' + Math.abs(item.handicapCount) + '球';
    }

    list.push({
      ...data,
      allowSingle: false,
      odd: oddsInfos.handicapVictory.win,
      resultDesc: `${fixedWidth(handicapDesc + '胜')}@${
        oddsInfos.handicapVictory.win
      }  ${data.homeTeam} vs  ${data.visitingTeam} `,
      codeDesc: `${data.code} ${handicapDesc} 胜`,
    });
    list.push({
      ...data,
      allowSingle: false,
      odd: oddsInfos.handicapVictory.draw,
      resultDesc: `${fixedWidth(handicapDesc + '平')}@${
        oddsInfos.handicapVictory.draw
      }  ${data.homeTeam} vs ${data.visitingTeam} `,
      codeDesc: `${data.code} ${handicapDesc} 平`,
    });
    list.push({
      ...data,
      allowSingle: false,
      odd: oddsInfos.handicapVictory.lose,
      resultDesc: `${fixedWidth(handicapDesc + '负')}@${
        oddsInfos.handicapVictory.lose
      }  ${data.homeTeam} vs ${data.visitingTeam}`,
      codeDesc: `${data.code} ${handicapDesc} 负`,
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
          ? `${fixedWidth(el.otherDesc)}@${el.odd}  ${data.homeTeam} vs ${
              data.visitingTeam
            } `
          : `${fixedWidth(el.home + ':' + el.visiting)}@${el.odd}  ${
              data.homeTeam
            } vs ${data.visitingTeam}`,
        codeDesc: el.isOther
          ? `${data.code} ${el.otherDesc}`
          : `${data.code} ${el.home}:${el.visiting}`,
      });
    });

    oddsInfos.goalList.forEach((el) => {
      list.push({
        ...data,
        odd: el.odd,
        resultDesc: `${fixedWidth('总进' + el.desc)}@${el.odd}  ${
          data.homeTeam
        } vs ${data.visitingTeam} `,
        codeDesc: `${data.code} 总进${el.desc}`,
      });
    });

    oddsInfos.halfVictoryList.forEach((el) => {
      list.push({
        ...data,
        odd: el.odd,
        resultDesc: `${fixedWidth(el.home + '/' + el.visiting)}@${el.odd}  ${
          data.homeTeam
        } vs ${data.visitingTeam}`,
        codeDesc: `${data.code} ${el.home}/${el.visiting} `,
      });
    });

    teamResultOddList.push(list);
  });

  let oddResultList = [];
  let teamCombinationList = [];

  function getTeamCombinationList(index) {
    const list = [];
    teamCombinationList.forEach((el) => {
      list.push([...el, teamResultOddList[index]]);
    });
    list.push([teamResultOddList[index]]);
    teamCombinationList = [...teamCombinationList, ...list];
    if (index < teamResultOddList.length - 1) {
      getTeamCombinationList(index + 1);
    }
  }

  getTeamCombinationList(0);

  for (let i = 0; i < teamCombinationList.length; i++) {
    const list = teamCombinationList[i];

    if (list.length === 1) {
      list[0].forEach((item) => {
        if (item.allowSingle !== false) {
          oddResultList.push({
            list: [item],
            count: item.odd,
          });
        }
      });
    } else {
      function againForEach(againList, index) {
        list[index].forEach((el) => {
          if (index === list.length - 1) {
            let data = {
              list: [],
              count: 1,
            };
            [...againList, el].forEach((item) => {
              data.list.push(item);
              data.count *= item.odd;
            });
            if (argTeamOddList.length == 4 && data.count > 250000) {
              data.count = 250000;
            }
            oddResultList.push(data);
          } else {
            againForEach([...againList, el], index + 1);
          }
        });
      }
      againForEach([], 0);
    }
  }

  oddResultList.sort((a, b) => a.count - b.count);
  return oddResultList;
}

self.onmessage = function (e) {
  const { teamOddList } = e.data;
  try {
    const result = calculateOddResultList(teamOddList);
    self.postMessage({ success: true, data: result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};
