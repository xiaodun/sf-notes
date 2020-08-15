import { TNotes } from './TNotes';

import request from '@/utils/request';
import TRes from '@/common/type/TResponse';
export namespace SNotes {
  export async function getList(): Promise<
    TRes.Item<TRes.List<TNotes.Item>>
  > {
    return request.get('/notes/list');
  }
}
export default SNotes;
