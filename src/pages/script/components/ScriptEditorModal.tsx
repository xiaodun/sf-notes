import React, { useEffect, useImperativeHandle, useState } from "react";
import { Form, Input, Modal, Button, message } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import SScript from "../SScript";
import { CustomScript, ScriptParamDef } from "../NScript";

export interface IScriptEditorModal {
  open: (script?: CustomScript) => void;
}

interface Props {
  onSaved: () => void;
}

const ScriptEditorModal = React.forwardRef<IScriptEditorModal, Props>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<CustomScript | null>(null);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    open(script) {
      setEditing(script || null);
      setVisible(true);
    },
  }));

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      form.setFieldsValue({
        name: editing.name,
        description: editing.description,
        command: editing.command,
        params: editing.params?.length
          ? editing.params
          : [{ key: "", label: "", placeholder: "" }],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        params: [{ key: "", label: "", placeholder: "" }],
      });
    }
  }, [visible, editing, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const params: ScriptParamDef[] = (values.params || [])
      .filter((p: ScriptParamDef) => p.key && p.label)
      .map((p: ScriptParamDef) => ({
        key: p.key.trim(),
        label: p.label.trim(),
        placeholder: p.placeholder?.trim() || "",
        required: true,
      }));

    const rsp = await SScript.saveScript({
      id: editing?.id,
      name: values.name.trim(),
      description: values.description?.trim() || "",
      command: values.command,
      params,
      createTime: editing?.createTime,
    });

    if (rsp.success) {
      setVisible(false);
      props.onSaved();
    } else {
      message.error(rsp.message || "保存失败");
    }
  };

  return (
    <Modal
      title={editing ? "编辑脚本" : "新建脚本"}
      open={visible}
      onCancel={() => setVisible(false)}
      onOk={handleOk}
      width={640}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="名称" rules={[{ required: true, message: "请输入名称" }]}>
          <Input placeholder="例如：重启应用" />
        </Form.Item>
        <Form.Item name="description" label="说明">
          <Input placeholder="可选" />
        </Form.Item>
        <Form.Item
          name="command"
          label="命令"
          rules={[{ required: true, message: "请输入命令" }]}
          extra="支持 {{变量名}} 占位符，多行命令会按 shell 顺序执行"
        >
          <Input.TextArea rows={5} placeholder={"adb shell am force-stop com.example.app\nadb shell monkey -p com.example.app 1"} />
        </Form.Item>
        <Form.List name="params">
          {(fields, { add, remove }) => (
            <>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>参数</div>
              {fields.map(({ key, name, ...restField }) => (
                <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Form.Item {...restField} name={[name, "key"]} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="变量 key" />
                  </Form.Item>
                  <Form.Item name={[name, "label"]} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="显示名称" />
                  </Form.Item>
                  <Form.Item name={[name, "placeholder"]} style={{ flex: 1, marginBottom: 0 }}>
                    <Input placeholder="占位提示" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} style={{ marginTop: 8, color: "#999" }} />
                </div>
              ))}
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                添加参数
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
});

export default ScriptEditorModal;
