import { initial } from 'lodash';
import { produce } from '..';

export interface TRes<T> {
  success?: boolean;
  message?: string;
  list?: T[];
  data?: T;
}
export namespace TRes {
  export function delItem<T>(
    res: TRes<T>,
    del: (item: T) => boolean,
  ) {
    let newRes = { ...res };
    const index = newRes.list.findIndex(del);
    if (index !== -1) {
      newRes.list.splice(index, 1);
    }

    return newRes;
  }
  export function addItem<T>(
    res: TRes<T>,
    onAdd: (dataList: T[]) => T[],
  ) {
    let newRes = { ...res };
    newRes.list = onAdd(newRes.list);
    return newRes;
  }
  export function updateItem<T>(
    res: TRes<T>,
    data: T,
    onUpdate: (data: T) => boolean,
  ) {
    let newRes = { ...res };
    const index = newRes.list.findIndex(onUpdate);
    newRes.list.splice(index, 1, data);

    return newRes;
  }
  export function switchItem<T>(
    res: TRes<T>,
    data: T,
    onPos: () => { currentIndex: number; targetIndex: number },
  ) {
    let newRes = { ...res };
    const { currentIndex, targetIndex } = onPos();
    const targetData = newRes.list[targetIndex];

    newRes.list.splice(currentIndex, 1, targetData);
    newRes.list.splice(targetIndex, 1, data);

    return newRes;
  }
  export function changePos<T>(res: TRes<T>, data: T, pos: number) {
    let newRes = { ...res };

    const index = newRes.list.indexOf(data);

    newRes.list.splice(index, 1);
    newRes.list.splice(pos, 0, data);

    return newRes;
  }
}
export default TRes;
