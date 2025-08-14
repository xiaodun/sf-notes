export interface NFootball {
  name: string;
  money: number;
  isEdit?: boolean;
  id?: string;
  bonusItems: {
    [key: string]: NFootball.IOddResult;
  };
}
export namespace NFootball {
  export interface IPredictResult {
    [key: string]: {
      hasResult: boolean;
      desc: string;
      odds: number;
    }[];
  }
  export interface IGameInfo {
    date: string;
    homeTeam: string;
    visitingTeam: string;
    code: string;
    bet_id: string;
  }
  export interface IUrlQuery {
    id: string;
  }
  export interface IVictoryOdds {
    win: number;
    draw: number;
    lose: number;
  }
  export interface IScoreOdds {
    home: number;
    visiting: number;
    odd?: number;
    isOther?: boolean;
    otherDesc?: string;
  }

  export interface IGoalOdds {
    count: number;
    desc: string;
    odd?: number;
    isOther?: boolean;
  }
  export interface IHalfVictoryOdds {
    home: string;
    visiting: string;
    odd?: number;
  }
  export interface IOddResult {
    list: Array<ITeamResultOdds>;
    count: number;
  }
  export interface IGameOdds {
    singleVictory: IVictoryOdds;
    handicapVictory: IVictoryOdds;
    score: {
      winList: Array<IScoreOdds>;
      drawList: Array<IScoreOdds>;
      loseList: Array<IScoreOdds>;
    };
    goalList: Array<IGoalOdds>;
    halfVictoryList: Array<IHalfVictoryOdds>;
  }
  export interface ITeamOdds {
    time: string;
    date: string;
    id?: string;
    code: string;
    homeTeam: string;
    visitingTeam: string;
    handicapCount: number;
    matchId: string;
  }
  export interface ITeamResultOdds extends ITeamOdds {
    resultDesc: string;
    allowSingle?: boolean;
    codeDesc: string;
    odd: number;
  }
  export interface ITeamRecordOdds extends ITeamOdds {
    openVictory: boolean;
    oddsInfos: IGameOdds;
  }
  export interface IConfig {
    maxGameCount: number;
  }

  // 足球比赛数据类型
  export interface IFootballMatch {
    isMock: boolean;
    matchId: string; // 比赛ID
    date: string;
    game: string; // 场次
    win: number; // 胜赔率
    draw: number; // 平赔率
    lose: number; // 负赔率
    handicap: number; // 让球胜平负赔率
    half: number; // 半全场赔率
    halfDesc: string; // 半全场描述
    goal: number; // 总进球赔率
    goalDesc: string; // 总进球描述
    score: string; // 比分
    scoreDesc: string; // 比分描述
  }

  // 获取近期比赛结果的请求参数
  export interface IGetRecentMatchesParams {
    startDate?: string;
    endDate?: string;
  }
}
export default NFootball;
