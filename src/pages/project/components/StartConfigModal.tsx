import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Typography, message } from 'antd';
import SProject from '../SProject';

interface StartConfigModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  project?: any;
  onConfigSuccess?: () => void;
}

const StartConfigModal: React.FC<StartConfigModalProps> = ({
  visible,
  onClose,
  projectId,
  projectName,
  project,
  onConfigSuccess,
}) => {
  const [commands, setCommands] = useState<string[]>(['npm run dev']);
  const [runUrl, setRunUrl] = useState('http://localhost:');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && project && project.startConfig) {
      const currentCommands = (project.startConfig.commands || []).filter(Boolean);
      setCommands(currentCommands.length ? currentCommands : ['npm run dev']);
      setRunUrl(project.startConfig.runUrl || 'http://localhost:');
    } else if (visible) {
      setCommands(['npm run dev']);
      setRunUrl('http://localhost:');
    }
  }, [visible, project]);

  const addCommand = () => {
    setCommands((prev) => [...prev, '']);
  };

  const updateCommand = (index: number, value: string) => {
    setCommands((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const removeCommand = (index: number) => {
    setCommands((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      const next = [...prev];
      next.splice(index, 1);
      return next.length ? next : [''];
    });
  };

  const handleSubmit = async () => {
    const validCommands = commands
      .map((item) => String(item || '').trim())
      .filter(Boolean);
    if (!validCommands.length) {
      message.error('请至少配置一条启动命令');
      return;
    }

    setLoading(true);
    try {
      const rsp = await SProject.saveProjectStartConfig({
        projectId,
        commands: validCommands,
        runUrl: String(runUrl || '').trim(),
      });
      if (rsp.success) {
        message.success('配置已保存');
        onClose();
        if (onConfigSuccess) {
          onConfigSuccess();
        }
      } else {
        message.error(rsp.message || '配置失败');
      }
    } catch (error) {
      message.error('配置失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="配置"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          确定
        </Button>,
      ]}
    >
      <Typography.Text style={{ marginBottom: 8, display: 'block' }}>启动命令</Typography.Text>
      {commands.map((item, index) => (
        <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <Input.TextArea
            value={item}
            onChange={(e) => updateCommand(index, e.target.value)}
            placeholder="请输入启动命令"
            autoSize={{ minRows: 2, maxRows: 6 }}
          />
          {commands.length > 1 && (
            <Button danger onClick={() => removeCommand(index)}>
              删除
            </Button>
          )}
        </div>
      ))}
      <Button type="dashed" onClick={addCommand} style={{ width: '100%', marginTop: 8 }}>
        添加命令
      </Button>
      <Typography.Text style={{ marginTop: 12, marginBottom: 8, display: 'block' }}>项目运行地址</Typography.Text>
      <Input
        value={runUrl}
        onChange={(e) => setRunUrl(e.target.value)}
        placeholder="例如 http://localhost:"
        allowClear
      />
    </Modal>
  );
};

export default StartConfigModal;
