
import {connect as umiConnect} from "umi";
import {Connect as IConnect} from "react-redux";
export namespace NConnect {
    export const connect = umiConnect as IConnect;
}