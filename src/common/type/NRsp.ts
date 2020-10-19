export interface NRsp<T = null> {
  success?: boolean;
  message?: string;
  list?: T[];
  data?: T;
}
export namespace NRsp {
  export function delItem<T>(
    rsp: NRsp<T>,
    del: (item: T) => boolean,
  ) {
    let newRsp = { ...rsp };
    const index = newRsp.list.findIndex(del);
    if (index !== -1) {
      newRsp.list.splice(index, 1);
    }

    return newRsp;
  }
  export function addItem<T>(
    rsp: NRsp<T>,
    onAdd: (dataList: T[]) => T[],
  ) {
    let newRsp = { ...rsp };
    newRsp.list = onAdd(newRsp.list);
    return newRsp;
  }
  export function updateItem<T>(
    rsp: NRsp<T>,
    data: T,
    onUpdate: (data: T) => boolean,
  ) {
    let newRsp = { ...rsp };
    const index = newRsp.list.findIndex(onUpdate);
    newRsp.list.splice(index, 1, data);

    return newRsp;
  }
  export function switchItem<T>(
    rsp: NRsp<T>,
    data: T,
    onPos: () => { currentIndex: number; targetIndex: number },
  ) {
    let newRsp = { ...rsp };
    const { currentIndex, targetIndex } = onPos();
    const targetData = newRsp.list[targetIndex];

    newRsp.list.splice(currentIndex, 1, targetData);
    newRsp.list.splice(targetIndex, 1, data);

    return newRsp;
  }
  export function changePos<T>(rsp: NRsp<T>, data: T, pos: number) {
    let newRsp = { ...rsp };

    const index = newRsp.list.indexOf(data);

    newRsp.list.splice(index, 1);
    newRsp.list.splice(pos, 0, data);

    return newRsp;
  }
}
export default NRsp;
