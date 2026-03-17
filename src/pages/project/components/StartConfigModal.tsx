import React, { useState, useEffect } from 'react';
import { Button, Modal, Input, Space, Typography, message } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import SProject from '../SProject';

const { Text } = Typography;
const { TextArea } = Input;

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
  const [commands, setCommands] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && project && project.sfMock && project.sfMock.startCommands) {
      setCommands(project.sfMock.startCommands);
    } else if (visible) {
      setCommands(['']);
    }
  }, [visible, project]);

  const handleAddCommand = () => {
    setCommands([...commands, '']);
  };

  const handleRemoveCommand = (index: number) => {
    if (commands.length > 1) {
      const newCommands = [...commands];
      newCommands.splice(index, 1);
      setCommands(newCommands);
    }
  };

  const handleCommandChange = (index: number, value: string) => {
    const newCommands = [...commands];
    newCommands[index] = value;
    setCommands(newCommands);
  };

  const handleSubmit = async () => {
    if (commands.some(cmd => !cmd.trim())) {
      message.error('请填写所有命令');
      return;
    }

    setLoading(true);
    try {
      const rsp = await SProject.startProjectWithCommands({
        projectId,
        projectName,
        commands,
      });
      if (rsp.success) {
        message.success('配置成功');
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
      title="配置启动命令"
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
      <div style={{ marginBottom: 20 }}>
        <Text>为项目 {projectName} 配置启动命令：</Text>
      </div>
      {commands.map((command, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: 10, width: '100%' }}>
          <TextArea
            value={command}
            onChange={(e) => handleCommandChange(index, e.target.value)}
            placeholder="请输入启动命令"
            rows={2}
            style={{ flex: 1, width: '100%' }}
          />
          {commands.length > 1 && (
            <Button
              danger
              icon={<MinusOutlined />}
              onClick={() => handleRemoveCommand(index)}
              style={{ alignSelf: 'flex-start', marginTop: 8, marginLeft: 10 }}
            />
          )}
        </div>
      ))}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={handleAddCommand}
        style={{ width: '100%', marginTop: 10 }}
      >
        添加命令
      </Button>
    </Modal>
  );
};

export default StartConfigModal;