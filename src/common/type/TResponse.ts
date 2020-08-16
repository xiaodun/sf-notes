export interface TRes<T> {
  success: boolean;
  message: string;
  data: T[];
  no: number;
  size: number;
  total: number;
}
export namespace TRes {
  export class Lists<T> {
    public tables: {
      dataSource: T[];
      loading: boolean;
    } = {
      dataSource: [],
      loading: true,
    };
    public paginations = {
      current: 0,
      pageSize: 0,
      total: 0,
    };
    public data: T[] = [];
    public pageNo = 0;
    public pageSize = 0;
    public total = 0;
  }
  export function asLists<T>(res: TRes<T>) {
    let list = new Lists<T>();
    list.data = res.data;
    list.pageNo = res.no;
    list.pageSize = res.size;
    list.total = res.total;

    list.paginations = {
      current: res.no,
      pageSize: res.size,
      total: res.total,
    };
    list.tables = {
      dataSource: res.data,
      loading: false,
    };

    return list;
  }
}
export default TRes;
