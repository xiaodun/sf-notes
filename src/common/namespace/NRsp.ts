import { produce } from "..";

export interface NRsp<T = null> {
  success?: boolean;
  message?: string;
  list?: T[];
  data?: T;
}
export namespace NRsp {
  export function delItem<T>(rsp: NRsp<T>, del: (item: T) => boolean) {
    const newRsp = produce(rsp, (drafState: NRsp<T>) => {
      const index = drafState.list.findIndex(del);
      if (index !== -1) {
        drafState.list.splice(index, 1);
      }
    });

    return newRsp;
  }
  export function addItem<T>(rsp: NRsp<T>, onAdd: (dataList: T[]) => T[]) {
    const newRsp = produce(rsp, (drafState: NRsp<T>) => {
      drafState.list = onAdd(drafState.list);
    });
    return newRsp;
  }
  export function updateItem<T>(
    rsp: NRsp<T>,
    data: T,
    onUpdate: (data: T) => boolean
  ) {
    const newRsp = produce(rsp, (drafState: NRsp<T>) => {
      const index = drafState.list.findIndex(onUpdate);
      drafState.list.splice(index, 1, data);
    });
    return newRsp;
  }
  export function switchItem<T>(
    rsp: NRsp<T>,
    data: T,
    onPos: () => { currentIndex: number; targetIndex: number }
  ) {
    const newRsp = produce(rsp, (drafState: NRsp<T>) => {
      const { currentIndex, targetIndex } = onPos();
      const targetData = drafState.list[targetIndex];

      drafState.list.splice(currentIndex, 1, targetData);
      drafState.list.splice(targetIndex, 1, data);
    });

    return newRsp;
  }
  export function changePos<T>(rsp: NRsp<T>, data: T, pos: number) {
    const newRsp = produce(rsp, (drafState: NRsp<T>) => {
      const index = rsp.list.indexOf(data);

      drafState.list.splice(index, 1);
      drafState.list.splice(pos, 0, data);
    });

    return newRsp;
  }
}
export default NRsp;
