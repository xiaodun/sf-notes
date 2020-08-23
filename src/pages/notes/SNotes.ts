import TNotes from './TNotes';

import request from '@/utils/request';
import TRes from '@/common/type/TRes';
export namespace SNotes {
  export async function getList(): Promise<TRes<TNotes>> {
    return request.get('/notes/getNoteList');
  }
  export async function delItem(id: string): Promise<TRes<null>> {
    return request.get('/notes/delNote', { params: { id } });
  }
  export async function addItem(
    notes: TNotes,
    index: number = 0,
  ): Promise<TRes<null>> {
    return request.post('/notes/addNote', {
      data: {
        notes,
        index,
      },
    });
  }
  export async function editItem(notes: TNotes): Promise<TRes<null>> {
    return request.post('/notes/editNote', {
      data: notes,
    });
  }
  export async function topItem(notes: TNotes): Promise<TRes<null>> {
    return request.post('/notes/topNote', {
      data: notes,
    });
  }
}
export default SNotes;
