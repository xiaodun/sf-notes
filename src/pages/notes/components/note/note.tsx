import React, { ReactNode } from 'react';
import SelfStyle from './note.less';
import { Card, Button, Menu, Dropdown } from 'antd';
import {
  CopyOutlined,
  EditOutlined,
  CloseOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import note from './notes.json';
import SyntaxHighlighter from 'react-syntax-highlighter';
const Note = () => {
  const menu = (
    <Menu>
      <Menu.Item key="noitce_top">置顶</Menu.Item>
      <Menu.Item key="add_up">向上添加</Menu.Item>
      <Menu.Item key="add_down">向下添加</Menu.Item>
    </Menu>
  );
  return (
    <Card
      title={note.title}
      className={SelfStyle.codeWrapper}
      extra={<Button icon={<CloseOutlined></CloseOutlined>}></Button>}
      actions={[
        <CopyOutlined />,
        <EditOutlined key="edit" />,
        <Dropdown overlay={menu} placement="topCenter">
          <Button>
            <EllipsisOutlined key="ellipsis" />
          </Button>
        </Dropdown>,
      ]}
    >
      {parseContent(note.content, note.base64)}
    </Card>
  );
};

export default Note;
function parseContent(content: string = '', base64imgs: Object) {
  let list = dealCode(content);
  list = dealLink(list, base64imgs);
  list = withAble(list);
  return list;
}
function dealCode(content: string) {
  //处理代码块
  let prefix = 'code',
    key = 0;

  const codePattern = /```([\s\S]*?)```/g;
  let list: ReactNode[] = [];

  let result: RegExpExecArray | null,
    lastIndex = 0;
  while ((result = codePattern.exec(content)) !== null) {
    if (result.index !== lastIndex) {
      list.push(content.substring(lastIndex, result.index));
    }
    if (result[1]) {
      list.push(
        <div key={prefix + key++} className={SelfStyle.codeWrapper}>
          <SyntaxHighlighter showLineNumbers>
            {result[1]}
          </SyntaxHighlighter>
        </div>,
      );
    }

    lastIndex = result.index + result[0].length;
  }
  if (lastIndex !== content.length)
    list.push(content.substring(lastIndex, content.length));
  return list;
}
function dealLink(list: ReactNode[], base64imgs: Object) {
  //处理链接
  const base64img_key = 'base64img';
  let prefix = 'link',
    key = 0;

  const imgStuffixList = ['.jpg', '.jpeg', '.gif', '.png', '.svg'];
  const linkPattern = RegExp(
    `(https?|ftp|file|${base64img_key})://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]`,
    'g',
  );
  const newList: ReactNode[] = [];
  list.forEach((item) => {
    if (typeof item === 'string') {
      let strList = item.split(/\n/);

      strList.forEach((str) => {
        let result: RegExpExecArray | null,
          lastIndex = 0;

        if (str.match(linkPattern)) {
          while ((result = linkPattern.exec(str)) !== null) {
            if (result.index !== lastIndex) {
              newList.push(str.substring(lastIndex, result.index));
            }
            const link = result[0];
            const isImg = imgStuffixList.some(
              (stuffix) => link.lastIndexOf(stuffix) !== -1,
            );
            if (isImg) {
              //图片
              const isPaste = link.indexOf(base64img_key) === 0;
              if (isPaste) {
                //黏贴图片
                const src = base64imgs[link];
                newList.push(
                  <img key={prefix + key++} src={src} alt="" />,
                );
              } else {
                newList.push(
                  <img key={prefix + key++} src={link} alt="" />,
                );
              }
            } else {
              //普通链接
              newList.push(
                <a target="_blank" key={prefix + key++} href={link}>
                  {link}
                </a>,
              );
            }
            lastIndex = result.index + link.length;
          }
          if (lastIndex !== str.length) {
            newList.push(lastIndex);
          }
        } else {
          newList.push(str);
        }
      });
    } else {
      newList.push(item);
    }
  });
  return newList;
}

function withAble(list: ReactNode[]) {
  //对每一个特殊元素块或一行赋予一些能力
  let prefix = 'line',
    key = 0;
  const newList: ReactNode[] = [];

  list.forEach((item) => {
    newList.push(
      <div key={prefix + key++} className={SelfStyle.lineWrapper}>
        {item}
      </div>,
    );
  });
  return newList;
}
