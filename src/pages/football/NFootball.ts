export interface NFootball {
  id?: number;
  name: string;
  time: number;
}
export namespace NFootball {
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
    base: number;
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
    id?: string;
    code: string;
    homeTeam: string;
    visitingTeam: string;
    isLet: boolean;
    handicapCount: number;
  }
  export interface ITeamResultOdds extends ITeamOdds {
    resultDesc: string;
    odd: number;
  }
  export interface ITeamRecordOdds extends ITeamOdds {
    time: number;
    openVictory: boolean;
    oddsInfos: IGameOdds;
  }
  export interface IConfig {}
}
export default NFootball;
