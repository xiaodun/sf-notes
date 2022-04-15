import { Modal } from "antd";
import SelfStyle from "./LModal.less";
import React from "react";
import { NModal } from "./NModal";
export namespace UModal {
  export function showExecResult(list: NModal.IOptionExecMessage[]) {
    Modal.info({
      icon: null,
      content: list.map((item, index) => (
        <div key={index} className={SelfStyle.execResult}>
          <div className="title">{item.title}</div>
          {item.success ? (
            <div className="success">成功</div>
          ) : (
            <div className="fail">{item.errorMsg}</div>
          )}
        </div>
      )),
    });
  }
}
