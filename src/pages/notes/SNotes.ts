import TNotes from './TNotes';

import request from '@/utils/request';
import TRes from '@/common/type/TRes';
export namespace SNotes {
  export async function getList(): Promise<TRes<TNotes>> {
    return request.get('/notes/getList');
  }
  export async function delItem(id: string): Promise<TRes<null>> {
    return request.get('/notes/delItem', { params: { id } });
  }
  export async function addItem(
    notes: TNotes,
    index: number = 0,
  ): Promise<TRes<null>> {
    return request.post('/notes/addItem', {
      data: {
        notes,
        index,
      },
    });
  }
}
export default SNotes;
