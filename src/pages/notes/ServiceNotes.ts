import { TypeNotes } from './TypeNotes';
import { IResponse, PageList } from '@/common/type/TypeCommon';
import request from '@/utils/request';

export namespace ServiceNotes {
  export async function getList(): Promise<
    IResponse<PageList<TypeNotes.Item>>
  > {
    return request.get('/notes/list');
  }
}
