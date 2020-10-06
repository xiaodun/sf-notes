export interface NRes<T> {
  success?: boolean;
  message?: string;
  list?: T[];
  data?: T;
}
export namespace NRes {
  export function delItem<T>(
    res: NRes<T>,
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
    res: NRes<T>,
    onAdd: (dataList: T[]) => T[],
  ) {
    let newRes = { ...res };
    newRes.list = onAdd(newRes.list);
    return newRes;
  }
  export function updateItem<T>(
    res: NRes<T>,
    data: T,
    onUpdate: (data: T) => boolean,
  ) {
    let newRes = { ...res };
    const index = newRes.list.findIndex(onUpdate);
    newRes.list.splice(index, 1, data);

    return newRes;
  }
  export function switchItem<T>(
    res: NRes<T>,
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
  export function changePos<T>(res: NRes<T>, data: T, pos: number) {
    let newRes = { ...res };

    const index = newRes.list.indexOf(data);

    newRes.list.splice(index, 1);
    newRes.list.splice(pos, 0, data);

    return newRes;
  }
}
export default NRes;
