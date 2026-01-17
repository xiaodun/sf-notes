import React, { useState, useImperativeHandle, ForwardRefRenderFunction, forwardRef } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import NNovel from "../NNovel";
import SNovel from "../SNovel";
import DirectoryModal, { IDirectoryModal } from "@/common/components/directory/combination/modal/DirectoryModal";
import { NSystem } from "@/common/namespace/NSystem";

export interface IAddNovelModal {
  showModal: (novel?: NNovel) => void;
}

export interface IAddNovelModalProps {
  onOk: () => void;
}

const AddNovelModal: ForwardRefRenderFunction<IAddNovelModal, IAddNovelModalProps> = (props, ref) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [editingNovel, setEditingNovel] = useState<NNovel | null>(null);
  const directoryModalRef = React.useRef<IDirectoryModal>(null);

  useImperativeHandle(ref, () => ({
    showModal: (novel?: NNovel) => {
      setVisible(true);
      if (novel) {
        setEditingNovel(novel);
        form.setFieldsValue({
          name: novel.name,
          path: novel.path,
        });
      } else {
        setEditingNovel(null);
        form.resetFields();
      }
    },
  }));

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const novelData: Partial<NNovel> = {
        name: values.name,
        path: values.path,
      };

      let result;
      if (editingNovel?.id) {
        result = await SNovel.editItem({
          ...editingNovel,
          ...novelData,
        } as NNovel);
      } else {
        result = await SNovel.addItem(novelData as NNovel);
      }

      if (result.success) {
        message.success(editingNovel?.id ? "修改成功" : "添加成功");
        setVisible(false);
        form.resetFields();
        props.onOk();
      } else {
        message.error(result.message || "操作失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
    }
  };

  const handleCancel = () => {
    setVisible(false);
    form.resetFields();
    setEditingNovel(null);
  };

  const handleChoosePath = () => {
    directoryModalRef.current?.showModal({
      disableFile: true, // 只能选择文件夹
      selectCallbackFlag: "novelPath",
    });
  };

  const handleSelectDirectory = (pathInfos: NSystem.IDirectory, selectCallbackFlag?: string) => {
    if (selectCallbackFlag === "novelPath") {
      form.setFieldsValue({
        path: pathInfos.path,
      });
    }
  };

  return (
    <>
      <Modal
        title={editingNovel?.id ? "编辑小说" : "添加小说"}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="小说名称"
            rules={[{ required: true, message: "请输入小说名称" }]}
          >
            <Input placeholder="请输入小说名称" />
          </Form.Item>
          <Form.Item
            name="path"
            label="小说路径"
            rules={[{ required: true, message: "请选择小说路径" }]}
          >
            <Input
              readOnly
              placeholder="请选择小说文件夹路径"
              addonAfter={
                <Button onClick={handleChoosePath} size="small">
                  选择路径
                </Button>
              }
            />
          </Form.Item>
        </Form>
      </Modal>
      <DirectoryModal ref={directoryModalRef} onOk={handleSelectDirectory} />
    </>
  );
};

export default forwardRef(AddNovelModal);

