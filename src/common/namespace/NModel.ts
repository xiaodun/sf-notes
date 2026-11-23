import { SubscriptionsMapObject, EffectsCommandMap } from "dva";
import { NMDNotes, NMDGlobal, NMDProject } from "umi";
import { NMDJokes } from "@/pages/jokes/models/MDJokes";
import { NMDClassics } from "@/pages/classics/models/MDClassics";
import { NMDMaxim } from "@/pages/maxim/models/MDMaxim";
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
    MDNotes = "MDNotes",
    MDGlobal = "MDGlobal",
    MDProject = "MDProject",
    MDJokes = "MDJokes",
    MDClassics = "MDClassics",
    MDMaxim = "MDMaxim",
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
    [ENames.MDNotes]: NMDNotes.IState;
    [ENames.MDGlobal]: NMDGlobal.IState;
    [ENames.MDProject]: NMDProject.IState;
    [ENames.MDJokes]: NMDJokes.IState;
    [ENames.MDClassics]: NMDClassics.IState;
    [ENames.MDMaxim]: NMDMaxim.IState;
  }
  export function dispatch(action: NModel.IAction) {
    window.umiDispatch({
      type: `${action.namespace}/${action.type}`,
      payload: action.payload,
    });
  }
}
export default NModel;
