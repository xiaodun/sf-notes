import NFootball from "./NFootball";
namespace UFootball {
  export const hourFormatStr = "HH";
  export const dateFormatStr = `yyyy-MM-DD`;
  export const timeFormatStr = `${dateFormatStr} ${hourFormatStr}`;
  export const scoreWinOddList: Array<NFootball.IScoreOdds> = [
    {
      home: 1,
      visiting: 0,
      odd: null,
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
    {
      home: null,
      visiting: null,
      isOther: true,
      otherDesc: "胜其它",
    },
  ];
  export const scoreDrawOddList: Array<NFootball.IScoreOdds> = [
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
    {
      home: null,
      visiting: null,
      isOther: true,
      otherDesc: "平其他",
    },
  ];
  export const scoreLoseOddList: Array<NFootball.IScoreOdds> = [
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
    {
      home: null,
      visiting: null,
      isOther: true,
      otherDesc: "负其它",
    },
  ];
  export const goalOddList: Array<NFootball.IGoalOdds> = [
    {
      count: 0,
      desc: "0球",
    },
    {
      count: 1,
      desc: "1球",
    },
    {
      count: 2,
      desc: "2球",
    },
    {
      count: 3,
      desc: "3球",
    },
    {
      count: 4,
      desc: "4球",
    },
    {
      count: 5,
      desc: "5球",
    },
    {
      count: 6,
      desc: "6球",
    },
    {
      count: null,
      desc: "7+",
      isOther: true,
    },
  ];
  export const halfVictoryOddList: Array<NFootball.IHalfVictoryOdds> = [
    {
      home: "胜",
      visiting: "胜",
    },
    {
      home: "胜",
      visiting: "平",
    },
    {
      home: "胜",
      visiting: "负",
    },
    {
      home: "平",
      visiting: "胜",
    },
    {
      home: "平",
      visiting: "平",
    },
    {
      home: "平",
      visiting: "负",
    },
    {
      home: "负",
      visiting: "胜",
    },
    {
      home: "负",
      visiting: "平",
    },
    {
      home: "负",
      visiting: "负",
    },
  ];
}
export default UFootball;
