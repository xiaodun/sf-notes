import NNotes from './NNotes';

import request from '@/utils/request';
import NRes from '@/common/type/NRes';
export namespace SNotes {
  export async function getList(): Promise<NRes<NNotes>> {
    return request.get('/notes/getNoteList');
  }
  export async function delItem(id: string): Promise<NRes<null>> {
    return request.get('/notes/delNote', { params: { id } });
  }
  export async function addItem(
    notes: NNotes,
    index: number = 0,
  ): Promise<NRes<null>> {
    return request.post('/notes/addNote', {
      data: {
        notes,
        index,
      },
    });
  }
  export async function editItem(notes: NNotes): Promise<NRes<null>> {
    return request.post('/notes/editNote', {
      data: notes,
    });
  }
  export async function topItem(notes: NNotes): Promise<NRes<null>> {
    return request.post('/notes/topNote', {
      data: notes,
    });
  }
  export async function bottomItem(
    notes: NNotes,
  ): Promise<NRes<null>> {
    return request.post('/notes/bottomNote', {
      data: notes,
    });
  }
}
export default SNotes;
