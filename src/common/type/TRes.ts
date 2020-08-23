export interface TRes<T> {
  success: boolean;
  message?: string;
  list?: T[];
  data?: T;
  no?: number;
  size?: number;
  total?: number;
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
    list.data = res.list;
    list.pageNo = res.no;
    list.pageSize = res.size;
    list.total = res.total;

    list.paginations = {
      current: res.no,
      pageSize: res.size,
      total: res.total,
    };
    list.tables = {
      dataSource: res.list,
      loading: false,
    };

    return list;
  }
  export function delItem<T>(
    lists: Lists<T>,
    del: (item: T) => boolean,
  ) {
    let newDataList = [...lists.data];
    const index = newDataList.findIndex(del);
    if (index !== -1) {
      newDataList.splice(index, 1);
      let res: TRes<T> = {
        success: true,
        message: '',
        list: newDataList,
        no: lists.pageNo,
        size: lists.pageSize,
        total: lists.total - 1,
      };

      return asLists(res);
    }

    return lists;
  }
  export function addItem<T>(
    lists: Lists<T>,
    onAdd: (dataList: T[]) => T[],
  ) {
    let newDataList = [...lists.data];
    newDataList = onAdd(newDataList);
    let res: TRes<T> = {
      success: true,
      message: '',
      list: newDataList,
      no: lists.pageNo,
      size: lists.pageSize,
      total: lists.total + 1,
    };

    return asLists(res);
  }
  export function updateItem<T>(
    lists: Lists<T>,
    data: T,
    onUpdate: (data: T) => boolean,
  ) {
    let newDataList = [...lists.data];
    const index = newDataList.findIndex(onUpdate);
    newDataList.splice(index, 1, data);
    let res: TRes<T> = {
      success: true,
      message: '',
      list: newDataList,
      no: lists.pageNo,
      size: lists.pageSize,
      total: lists.total,
    };
    return asLists(res);
  }
}
export default TRes;
