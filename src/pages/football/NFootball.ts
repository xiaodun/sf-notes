export interface NFootball {
  id?: number;
  name: string;
  time: number;
}
export namespace NFootball {
  export interface IUrlQuery {
    id: number;
  }
  export interface IVictoryOdds {
    win: number;
    draw: number;
    lose: number;
  }

  export interface IGameOdds {
    singleVictory: IVictoryOdds;
    handicapVictory: IVictoryOdds;
    score: {
      home: number;
      visiting: number;
      odd: number;
    };
    goal: {
      [key: number]: number;
    };
    halfVictory: {
      home: string;
      visiting: string;
      odd: number;
    };
  }
  export interface ITeamOdds {
    homeTeam: string;
    visitingTeam: string;
    handicapCount: number;
    isLet: boolean;
    oddsInfos: IGameOdds;
  }
  export interface IConfig {}
}
export default NFootball;
