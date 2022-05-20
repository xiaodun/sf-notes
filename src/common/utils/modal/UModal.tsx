import { Modal, ModalFuncProps } from "antd";
import SelfStyle from "./LModal.less";
import React from "react";
import { NModal } from "./NModal";
export namespace UModal {
  export function showExecResult(
    list: NModal.IOptionExecMessage[],
    props: ModalFuncProps = {}
  ) {
    Modal.info({
      closable: true,
      icon: null,
      ...props,
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
  export function showConfirmOperation(
    data: NModal.IOptionConfirmMessage,
    props: ModalFuncProps = {}
  ) {
    Modal.confirm({
      closable: true,
      icon: null,
      cancelText: "取消",
      okText: "执行",
      ...props,
      content: (
        <div className={SelfStyle.confirmInfo}>
          {data.errorMsg ? (
            <div className="error-message">{data.errorMsg}</div>
          ) : (
            data.list.map((item, index) => (
              <div key={index} className="info">
                {item}
              </div>
            ))
          )}
        </div>
      ),
    });
  }
}
