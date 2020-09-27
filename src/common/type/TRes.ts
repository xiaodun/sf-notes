import { produce } from '..';

export interface TRes<T> {
  success: boolean;
  message?: string;
  list?: T[];
  data?: T;
}
export namespace TRes {
  export class Lists<T> {
    public loading = true;
    public data: T[] = [];
    public pageNo = 0;
    public pageSize = 0;
    public total = 0;
  }
  export function delItem<T>(
    lists: Lists<T>,
    del: (item: T) => boolean,
  ) {
    let newDataList = [...lists.data];
    const index = newDataList.findIndex(del);
    if (index !== -1) {
      newDataList.splice(index, 1);
    }
    let newLists: Lists<T> = produce(lists, (drafState) => {});

    return newLists;
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
  }
  export function switchItem<T>(
    lists: Lists<T>,
    data: T,
    onPos: () => { currentIndex: number; targetIndex: number },
  ) {
    let newDataList = [...lists.data];
    const { currentIndex, targetIndex } = onPos();
    const targetData = newDataList[targetIndex];

    newDataList.splice(currentIndex, 1, targetData);
    newDataList.splice(targetIndex, 1, data);
    let res: TRes<T> = {
      success: true,
      message: '',
      list: newDataList,
      no: lists.pageNo,
      size: lists.pageSize,
      total: lists.total,
    };
  }
  export function changePos<T>(
    lists: Lists<T>,
    data: T,
    pos: number,
  ) {
    let newDataList = [...lists.data];

    const index = newDataList.indexOf(data);

    newDataList.splice(index, 1);
    newDataList.splice(pos, 0, data);
    let res: TRes<T> = {
      success: true,
      message: '',
      list: newDataList,
      no: lists.pageNo,
      size: lists.pageSize,
      total: lists.total,
    };
  }
}
export default TRes;
