import NRsp from '@/common/namespace/NRsp';
import NBook from './NBook';
import request from '@/utils/request';

namespace SBook {
  export async function getList(): Promise<NRsp<NBook>> {
    return request({
      url: '/book/getBookList',
    });
  }
}
export default SBook;
