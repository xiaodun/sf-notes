import NRsp from '@/common/namespace/NRsp';
import NFootball from './NFootball';
import request from '@/utils/request';
import NModel from '@/common/namespace/NModel';
import { NMDFootball } from 'umi';

namespace SFootball {
  export async function getSingleOddInfo(
    code: string,
    bet_id: string
  ): Promise<NRsp<NFootball.ITeamRecordOdds>> {
    return request({
      url: '/football/getSingleOddInfo',
      method: 'post',
      data: {
        code,
        bet_id,
      },
    });
  }
  export async function getAllowGuessGame(): Promise<
    NRsp<NFootball.IGameInfo>
  > {
    return request({
      url: '/football/getAllowGuessGame',
      method: 'get',
    });
  }
  export async function getTeamOddList(id: string) {
    return request({
      url: '/football/getTeamOddList',
      method: 'post',
      data: {
        id,
      },
    }).then((rsp: NRsp<NFootball.ITeamRecordOdds>) => {
      NModel.dispatch(new NMDFootball.ARSetState({ teamOddList: rsp.list }));
      return rsp;
    });
  }
  export async function saveTeamOdds(
    id: string,
    teamOdds: NFootball.ITeamRecordOdds
  ): Promise<NRsp<boolean>> {
    return request({
      url: '/football/saveTeamOdds',
      method: 'post',
      data: {
        id,
        teamOdds,
      },
    });
  }
  export async function delPredict(id: number): Promise<NRsp<boolean>> {
    return request({
      url: '/football/delPredict',
      method: 'post',
      data: {
        id,
      },
    });
  }
  export async function createPredict(data: NFootball): Promise<NRsp<boolean>> {
    return request({
      url: '/football/createPredict',
      method: 'post',
      data,
    });
  }
  export async function getPredictList() {
    return request({
      url: '/football/getPredictList',
      method: 'post',
    }).then((rsp: NRsp<NFootball>) => {
      NModel.dispatch(new NMDFootball.ARSetState({ rsp }));
      return rsp;
    });
  }
  export async function getPredictInfoById(id: string) {
    return request({
      url: '/football/getPredictInfoById',
      method: 'post',
      data: {
        id,
      },
    }).then((rsp: NRsp<NFootball>) => {
      return rsp;
    });
  }
  export async function getConfig(): Promise<NRsp<NFootball.IConfig>> {
    return request({
      url: '/football/getConfig',
      method: 'get',
    });
  }

  /**
   * 获取近期足球比赛结果
   */
  export async function getRecentMatches(
    data: NFootball.IGetRecentMatchesParams = {}
  ): Promise<
    NRsp<{
      list: NFootball.IFootballMatch[];
      total: number;
      page: number;
      pageSize: number;
      isMock?: boolean;
    }>
  > {
    return request({
      url: '/football/getRecentMatches',
      method: 'post',
      data,
    });
  }

  /**
   * 获取比赛详细赔率信息
   */
  export async function getMatchOddsDetail(
    matchIds: string[]
  ): Promise<NRsp<{ [key: string]: NFootball.IFootballMatch }>> {
    return request({
      url: '/football/getMatchOddsDetail',
      method: 'post',
      data: {
        matchIds,
      },
    });
  }

  /**
   * 获取联赛列表
   */
  export async function getCompetitions(): Promise<NRsp<string[]>> {
    return request({
      url: '/football/getCompetitions',
      method: 'post',
    });
  }

  /**
   * 添加奖金项目
   */
  export async function addBonusItem(
    id: string,
    itemKey: string,
    oddResult: NFootball.IOddResult
  ): Promise<NRsp<boolean>> {
    return request({
      url: '/football/addBonusItem',
      method: 'post',
      data: {
        id,
        itemKey,
        oddResult,
      },
    });
  }
  export async function getGameResultList(
    matchBeginDate: string,
    matchEndDate: string,
    codeList: string[]
  ): Promise<NRsp<{ [key: string]: { matchId: string } }>> {
    return request({
      url: '/football/getGameResultList',
      method: 'post',
      data: {
        matchBeginDate,
        matchEndDate,
        codeList,
      },
    });
  }
  /**
   * 删除奖金项目
   */
  export async function removeBonusItem(
    id: string,
    itemKey: string
  ): Promise<NRsp<boolean>> {
    return request({
      url: '/football/removeBonusItem',
      method: 'post',
      data: {
        id,
        itemKey,
      },
    });
  }
}
export default SFootball;
