import React, { ReactNode } from 'react';
import SelfStyle from './note.less';
import { Card, Button, Menu, Dropdown, message, Space } from 'antd';
import {
  CopyOutlined,
  EditOutlined,
  CloseOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import TNotes from '../../TNotes';
import moment from 'moment';
import UCopy from '@/common/utils/UCopy';
import SNotes from '../../SNotes';
import TRes from '@/common/type/TRes';
import UDate from '@/common/utils/UDate';
import UNotes from '../../UNotes';

export interface INoteProps {
  onEdit: (data?: TNotes, index?: number) => void;
  data: TNotes;
  index: number;
  noteRes: TRes<TNotes>;
  setNoteRes: React.Dispatch<React.SetStateAction<TRes<TNotes>>>;
  showZoomModal: (src: string) => void;
  onEditSuccess: (notes: TNotes) => void;
}
export interface INoteAction {
  content: ReactNode;
  copyStr?: string;
  //第一个式起始位置  第二个是个数
  start: number;
  count: number;
}
const Note = (props: INoteProps) => {
  const { data } = props;
  let title =
    data.title ||
    moment(data.createTime || undefined).format(UDate.YYYY_MM_DD);
  const menu = (
    <Menu>
      <Menu.Item key="noitce_top" onClick={() => reqTopItem(data)}>
        置顶
      </Menu.Item>
      <Menu.Item
        key="noitce_bottom"
        onClick={() => reqBottomItem(data)}
      >
        置后
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="add_up"
        onClick={() => props.onEdit(null, props.index)}
      >
        向上添加
      </Menu.Item>
      <Menu.Item
        key="add_down"
        onClick={() => props.onEdit(null, props.index + 1)}
      >
        向下添加
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      size="small"
      title={title}
      className={SelfStyle.noteWrapper}
      extra={
        <Button
          onClick={() => reqDelItem(data.id)}
          icon={<CloseOutlined></CloseOutlined>}
        ></Button>
      }
      actions={[
        <CopyOutlined onClick={onCopy} />,
        <EditOutlined
          key="edit"
          onClick={() => props.onEdit(data)}
        />,
        <Dropdown overlay={menu} placement="topCenter">
          <Button>
            <EllipsisOutlined key="ellipsis" />
          </Button>
        </Dropdown>,
      ]}
    >
      {parseContent(data.content, data.base64)}
    </Card>
  );
  async function reqDelItem(id: string) {
    const res = await SNotes.delItem(id);
    if (res.success) {
      props.setNoteRes(
        TRes.delItem(props.noteRes, (item) => item.id === id),
      );
    }
  }
  async function onCopy() {
    UCopy.copyStr(data.content);
  }
  async function reqTopItem(data: TNotes) {
    const res = await SNotes.topItem(data);
    if (res.success) {
      const newNoteRes = TRes.changePos(props.noteRes, data, 0);
      props.setNoteRes(newNoteRes);
    }
  }
  async function reqBottomItem(data: TNotes) {
    const res = await SNotes.bottomItem(data);
    if (res.success) {
      const newNoteRes = TRes.changePos(
        props.noteRes,
        data,
        props.noteRes.list.length - 1,
      );
      props.setNoteRes(newNoteRes);
    }
  }
  function parseContent(content: string = '', base64imgs: Object) {
    let list = dealCode(content);
    list = dealLink(list, base64imgs);
    return withAble(list);
  }
  function dealCode(content: string) {
    //处理代码块
    let prefix = 'code',
      key = 0;
    const codeSign = '```';
    const codePattern = RegExp(
      `${codeSign}([\\s\\S]*?)${codeSign}`,
      'g',
    );
    let list: INoteAction[] = [];
    let result: RegExpExecArray | null,
      lastIndex = 0;
    while ((result = codePattern.exec(content)) !== null) {
      if (result.index !== lastIndex) {
        const value = content.substring(lastIndex, result.index);
        list.push({
          start: lastIndex,
          count: value.length,
          content: value,
        });
      }
      if (result[1]) {
        list.push({
          start: result.index,
          count: result[0].length,
          content: (
            <div
              key={prefix + key++}
              className={SelfStyle.codeWrapper}
            >
              <SyntaxHighlighter showLineNumbers>
                {result[1]}
              </SyntaxHighlighter>
            </div>
          ),
          copyStr: result[1],
        });
      }

      lastIndex = result.index + result[0].length;
    }
    if (lastIndex !== content.length)
      list.push({
        start: lastIndex,
        count: content.length,
        content: content.substring(lastIndex, content.length),
      });
    return list;
  }
  function dealLink(list: INoteAction[], base64imgs: Object) {
    //处理链接
    let prefix = 'link',
      key = 0;

    const imgStuffixList = ['.jpg', '.jpeg', '.gif', '.png', '.svg'];
    const linkPattern = RegExp(
      `(https?|ftp|file|${UNotes.imgProtocolKey})://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]`,
      'g',
    );
    const newList: INoteAction[] = [];
    list.forEach((item) => {
      if (typeof item.content === 'string') {
        /*
          "a\n\n\n1".split("\n") => ["a", "", "", "1"] 
          单独的"" 可以被看做\n
          与原始字符串相比 是少了一个\n
          1\n2\n3 少了二个
        */
        let strList = item.content.split(/\n/);
        if (strList[strList.length - 1] === '') {
          //1\n2\n => ["1","2",""]  在下面的算法中会统一加\n 所以最后面这个会被多算
          strList.pop();
        }
        if (strList.length > 1) {
          //如果只有一行 加换行符不好处理
          strList = strList.map((str) => str + '\n');
        }

        let initalCount = item.start;
        strList.forEach((str) => {
          let result: RegExpExecArray | null,
            lastIndex = 0;

          let partList: ReactNode[] = [];
          let copyStr = '';
          if (str.match(linkPattern)) {
            //里面的元素应该被渲染为一行
            while ((result = linkPattern.exec(str)) !== null) {
              if (result.index !== lastIndex) {
                const content = str.substring(
                  lastIndex,
                  result.index,
                );
                partList.push(content);
                copyStr += content;
              }
              const link = result[0];
              const isImg = imgStuffixList.some(
                (stuffix) => link.lastIndexOf(stuffix) !== -1,
              );
              if (isImg) {
                //图片
                const isPaste =
                  link.indexOf(UNotes.imgProtocolKey) === 0;
                let src: string;
                if (isPaste) {
                  //黏贴图片
                  src = base64imgs[link];
                } else {
                  src = link;
                }
                copyStr += src;
                partList.push(
                  <div
                    className={SelfStyle.imgWrapper}
                    onClick={() => props.showZoomModal(src)}
                  >
                    <img key={prefix + key++} src={src} alt="" />
                  </div>,
                );
              } else {
                //普通链接
                copyStr += link;
                partList.push(
                  <a target="_blank" key={prefix + key++} href={link}>
                    {link}
                  </a>,
                );
              }
              lastIndex = result.index + link.length;
            }
            if (lastIndex !== str.length) {
              const content = str.slice(lastIndex);
              if (content !== '\n') {
                copyStr += '\n';
              }
              partList.push(content);
            }
          } else {
            copyStr = str;
            partList.push(str);
          }
          newList.push({
            copyStr,
            start: initalCount,
            count: str.length,
            content: (
              <div className={SelfStyle.linkWrapper}>
                {partList.map((item, index) => {
                  let newItem = item;
                  if (typeof item === 'string') {
                    newItem = <span>{item}</span>;
                  }

                  return (
                    <React.Fragment key={index}>
                      {newItem}
                    </React.Fragment>
                  );
                })}
              </div>
            ),
          });

          initalCount += str.length;
        });
      } else {
        newList.push(item);
      }
    });
    return newList;
  }
  async function reqDelPart(start: number, count: number) {
    const content = props.data.content;
    const end = start + count;
    const newContent =
      content.substring(0, start) +
      content.substring(end, content.length);
    const newNote: TNotes = {
      ...props.data,
      content: newContent,
    };
    const res = await SNotes.editItem(newNote);
    if (res.success) {
      props.onEditSuccess(newNote);
    }
  }
  function withAble(list: INoteAction[]) {
    //对每一个特殊元素块或一行赋予一些能力
    let prefix = 'line',
      key = 0;
    const newList: ReactNode[] = [];

    list.forEach((item) => {
      newList.push(
        <div key={prefix + key++} className={SelfStyle.lineWrapper}>
          <div className="actions">
            <Space size="large">
              <a
                type="link"
                onClick={() => UCopy.copyStr(item.copyStr)}
              >
                复制
              </a>
              <a
                type="link"
                onClick={() => reqDelPart(item.start, item.count)}
              >
                删除
              </a>
            </Space>
          </div>
          <div className="contents">
            {item.content || <span>&nbsp;</span>}
          </div>
        </div>,
      );
    });
    return newList;
  }
};

export default Note;
