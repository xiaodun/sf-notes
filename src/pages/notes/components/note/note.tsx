import React, { ReactNode } from 'react';
import SelfStyle from './note.less';
import { Card, Button } from 'antd';
import {
  CopyOutlined,
  EditOutlined,
  CloseOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import noteJson from './notes.json';
const Note = () => {
  return (
    <Card
      title={noteJson.title}
      extra={<Button icon={<CloseOutlined></CloseOutlined>}></Button>}
      actions={[
        <CopyOutlined />,
        <EditOutlined key="edit" />,
        <EllipsisOutlined key="ellipsis" />,
      ]}
    >
      {parseContent(noteJson.content)}
    </Card>
  );
};

export default Note;
function parseContent(content: string = '') {
  let key = 0;
  let list: ReactNode[] = [];
  const base64img = 'base64img';

  const imgStuffixList = ['.jpg', '.jpeg', '.gif', '.png', '.svg'];
  const linkPattern = RegExp(
    `(https?|ftp|file|${base64img})://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]`,
    'g',
  );
  const codePattern = /```([\s\S]*?)```/g;

  //处理代码块
  let result: RegExpExecArray | null,
    lastIndex = 0;
  while ((result = codePattern.exec(content)) !== null) {
    if (result.index !== lastIndex) {
      list.push(content.substring(lastIndex, result.index));
    }
    if (result[1]) {
      list.push(
        <div key={key++} className={SelfStyle.codeWrapper}>
          {result[1]}
        </div>,
      );
    }

    lastIndex = result.index + result[0].length + 1;
  }
  if (lastIndex !== content.length)
    list.push(content.substring(lastIndex, content.length));
  return list;
}
