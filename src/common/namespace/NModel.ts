import { SubscriptionsMapObject, EffectsCommandMap } from "dva";
import {
  NMDTest,
  NMDNotes,
  NMDGlobal,
  NMDProject,
  NMDIterative,
  NMDFootball,
} from "umi";
interface NModel<S> {
  namespace: string;
  state?: S;
  reducers?: {
    [key: string]: (state: S, action: any) => void;
  };
  effects?: {
    [key: string]: (action: any, effects: EffectsCommandMap) => void;
  };
  subscriptions?: SubscriptionsMapObject;
}

namespace NModel {
  export enum ENames {
    MDTest = "MDTest",
    MDNotes = "MDNotes",
    MDGlobal = "MDGlobal",
    MDProject = "MDProject",
    MDIterative = "MDIterative",
    MDFootball = "MDFootball",
  }
  export class IAction<P = any> {
    type: string;
    namespace: string;
    payload: P;
    constructor(payload: P) {
      this.payload = payload;
    }
  }
  export interface IState {
    [ENames.MDTest]: NMDTest.IState;
    [ENames.MDNotes]: NMDNotes.IState;
    [ENames.MDGlobal]: NMDGlobal.IState;
    [ENames.MDProject]: NMDProject.IState;
    [ENames.MDIterative]: NMDIterative.IState;
    [ENames.MDFootball]: NMDFootball.IState;
  }
  export function dispatch(action: NModel.IAction) {
    window.umiDispatch({
      type: `${action.namespace}/${action.type}`,
      payload: action.payload,
    });
  }
}
export default NModel;
