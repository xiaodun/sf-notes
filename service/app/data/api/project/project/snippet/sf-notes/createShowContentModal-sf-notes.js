(function () {
  return function (argParams) {
    const _ = require("lodash");
    const prettier = require("prettier");
    const path = require("path");
    const fs = require("fs");

    return {
      writeOs: {
        open: true,
        needFolder: true,
        basePath: "\\src\\pages",
      },
      globalParamList: [
        {
          name: "modalName",
          label: "模态框名",
          type: "input",
          props: {
            placeholder:
              "示例:Group,选择components上一级路基即可,没有components会自动创建",
          },
          style: {
            width: 500,
          },
          require: true,
        },
        {
          name: "title",
          label: "标题",
          type: "input",
          style: {
            width: 300,
          },
          require: true,
        },
      ],
      fragmentList: [
        {
          title: "模态框文件",
          getTemplate() {
            return `
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message } from "antd";
import produce from "immer";
export interface I${argParams.modalName}Modal {
  showModal: () => void;
}
export interface I${argParams.modalName}ModalProps {
}

export interface I${argParams.modalName}ModalState {
  visible: boolean;
  
}
const defaultState: I${argParams.modalName}ModalState = {
  visible: false,
 
};
const ${argParams.modalName}Modal: ForwardRefRenderFunction<
  I${argParams.modalName}Modal,
  I${argParams.modalName}ModalProps
> = (props, ref) => {
  const [state, setState] = useState<I${argParams.modalName}ModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
         
        })
      );
      
    },
  }));

  return (
    <Modal
      width="500px"
      title="${argParams.title}"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >

    
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(${argParams.modalName}Modal);
                        
            
            
            `;
          },
          writeOs(template) {
            const componentsFolderPath = path.join(
              argParams.writeOsPath,
              "components"
            );
            if (!fs.existsSync(componentsFolderPath)) {
              fs.mkdirSync(componentsFolderPath);
            }
            fs.writeFileSync(
              path.join(
                componentsFolderPath,
                `${argParams.modalName}Modal.tsx`
              ),
              prettier.format(template, {
                parser: "typescript",
              })
            );
          },
        },
        {
          title: "导入语句",
          getTemplate() {
            return `
            import ${argParams.modalName}Modal, {
              I${argParams.modalName}Modal,
            } from "./components/${argParams.modalName}Modal";            
            
            `;
          },
        },
        {
          title: "ref语句",
          getTemplate() {
            return `
            const ${_.lowerFirst(argParams.modalName)}ModalRef = useRef<I${
              argParams.modalName
            }Modal>();
            `;
          },
        },
        {
          title: "组件声明",
          getTemplate() {
            return `
          <${argParams.modalName}Modal
            ref={${_.lowerFirst(argParams.modalName)}ModalRef}
          ></${argParams.modalName}Modal>
            
            `;
          },
        },
        {
          title: "打开模态框",
          getTemplate() {
            return `
            function onShow${argParams.modalName}Modal() {
              ${_.lowerFirst(argParams.modalName)}ModalRef.current.showModal(
               
              );
            }            
            
            `;
          },
        },
        {
          title: "打开按钮",
          getTemplate() {
            return `
            <Button onClick={()=>onShow${argParams.modalName}Modal()}>${argParams.title}</Button>       
            
            `;
          },
        },
      ],
    };
  };
})();
