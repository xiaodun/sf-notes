export interface NFootball {
  id?: number;
  name: string;
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
}
export default NFootball;
