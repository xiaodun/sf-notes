import NNotes from './NNotes';

import request from '@/utils/request';
import NRsp from '@/common/type/NRsp';
export namespace SNotes {
  export async function getList(): Promise<NRsp<NNotes>> {
    return request({
      url: '/notes/getNoteList',
    });
  }
  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: '/notes/delNote',
      params: {
        id,
      },
    });
  }
  export async function addItem(
    notes: NNotes,
    index: number = 0,
  ): Promise<NRsp<NNotes>> {
    return request({
      url: '/notes/addNote',
      method: 'post',
      data: {
        notes,
        index,
      },
    });
  }
  export async function editItem(notes: NNotes): Promise<NRsp> {
    return request({
      url: '/notes/editNote',
      method: 'post',
      data: notes,
    });
  }
  export async function topItem(notes: NNotes): Promise<NRsp> {
    return request({
      url: '/notes/topNote',
      method: 'post',
      data: notes,
    });
  }
  export async function bottomItem(notes: NNotes): Promise<NRsp> {
    return request({
      url: '/notes/bottomNote',
      method: 'post',
      data: notes,
    });
  }
}
export default SNotes;
