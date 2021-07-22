import React, { FC, ReactNode } from "react";
import SelfStyle from "./note.less";
import { Card, Button, Menu, Dropdown, Space } from "antd";
import {
  CopyOutlined,
  EditOutlined,
  CloseOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import SyntaxHighlighter from "react-syntax-highlighter";
import NNotes from "../../NNotes";
import UCopy from "@/common/utils/UCopy";
import SNotes from "../../SNotes";
import NRsp from "@/common/namespace/NRsp";
import { classNames } from "@/common";
import { NMDNotes } from "umi";
import NModel from "@/common/namespace/NModel";
import { IEditModal } from "../edit/EditModal";
import { IZoomImgModal } from "../zoom/ZoomImgModal";
import { NConnect } from "@/common/namespace/NConnect";
import { cloneDeep, isEqual } from "lodash";

type TCopyType = "img" | "str";
export interface INoteProps {
  data: NNotes;
  index: number;
  MDNotes: NMDNotes.IState;
  editModalRef: React.MutableRefObject<IEditModal>;
  zoomModalRef: React.MutableRefObject<IZoomImgModal>;
}
export interface INoteAction {
  content: ReactNode;
  copyStr?: string;
  //第一个式起始位置  第二个是个数
  start: number;
  count: number;
  type: TCopyType;
  copyId?: string;
}
const Note: FC<INoteProps> = (props) => {
  const { data, MDNotes } = props;
  const cloneData = cloneDeep(data);

  const menu = (
    <Menu>
      <Menu.Item key="noitce_top" onClick={() => reqTopItem(data)}>
        置顶
      </Menu.Item>
      <Menu.Item key="noitce_bottom" onClick={() => reqBottomItem(data)}>
        置后
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="add_up" onClick={() => onAddNote(props.index)}>
        向上添加
      </Menu.Item>
      <Menu.Item key="add_down" onClick={() => onAddNote(props.index + 1)}>
        向下添加
      </Menu.Item>
    </Menu>
  );
  const { isExpand } = MDNotes.noteSettingMap.get(data.id);
  return (
    <div>
      {MDNotes.isTitleModel && !isExpand ? (
        <Card
          size="small"
          title={data.title}
          className={classNames(SelfStyle.noteWrapper, SelfStyle.titleModel)}
          extra={
            <Button
              onClick={() => {
                NModel.dispatch(
                  new NMDNotes.ArChangeNoteExpand({
                    id: data.id,
                    isExpand: true,
                  })
                );
              }}
            >
              展开
            </Button>
          }
        ></Card>
      ) : (
        <>
          {renderActionWrap(SelfStyle.top)}
          <Card
            size="small"
            title={data.title}
            className={SelfStyle.noteWrapper}
            extra={
              <Button
                onClick={() => reqDelItem(data.id)}
                icon={<CloseOutlined></CloseOutlined>}
              ></Button>
            }
          >
            {parseContent(data.content, data.base64)}
          </Card>
          {renderActionWrap(SelfStyle.bottom)}
        </>
      )}
    </div>
  );
  function onUpdateNote(data: NNotes) {
    props.editModalRef.current.showModal(data);
  }
  function onAddNote(index: number) {
    props.editModalRef.current.showModal(null, index);
  }
  function renderActionWrap(className: any) {
    return (
      <div className={classNames(SelfStyle.actionWrap, className)}>
        <div className={SelfStyle.item}>
          <Button onClick={onCopy} icon={<CopyOutlined />}></Button>
        </div>
        <div className={SelfStyle.item}>
          <Button
            onClick={() => onUpdateNote(data)}
            icon={<EditOutlined key="edit" />}
          ></Button>
        </div>
        <div className={SelfStyle.item}>
          <Dropdown overlay={menu} placement="topCenter">
            <Button>
              <EllipsisOutlined key="ellipsis" />
            </Button>
          </Dropdown>
        </div>
      </div>
    );
  }
  async function reqDelItem(id: string) {
    const rsp = await SNotes.delItem(id);
    if (rsp.success) {
      NModel.dispatch(
        new NMDNotes.ARSetRsp(
          NRsp.delItem(MDNotes.rsp, (item) => item.id === id)
        )
      );
    }
  }
  async function onCopy() {
    UCopy.copyStr(data.content);
  }
  async function reqTopItem(data: NNotes) {
    const rsp = await SNotes.topItem(data);
    if (rsp.success) {
      NModel.dispatch(
        new NMDNotes.ARSetRsp(NRsp.changePos(MDNotes.rsp, data, 0))
      );
    }
  }
  async function reqBottomItem(data: NNotes) {
    const rsp = await SNotes.bottomItem(data);
    if (rsp.success) {
      NModel.dispatch(
        new NMDNotes.ARSetRsp(
          NRsp.changePos(MDNotes.rsp, data, MDNotes.rsp.list.length - 1)
        )
      );
    }
  }
  function parseContent(content: string = "", base64imgs: Object) {
    let list = dealCode(content);
    list = dealLink(list, base64imgs);
    if (!isEqual(data, cloneData)) {
      SNotes.editItem(cloneData).then((rsp) => {
        if (rsp.success) {
          const newNotesRsp = NRsp.updateItem(
            MDNotes.rsp,
            cloneData,
            (data) => data.id === cloneData.id
          );
          NModel.dispatch(new NMDNotes.ARSetRsp(newNotesRsp));
        }
      });
    }
    return withAble(list);
  }
  function dealCode(content: string) {
    //处理代码块
    let prefix = "code",
      key = 0;
    const codeSign = "```";
    const codePattern = RegExp(`${codeSign}([\\s\\S]*?)${codeSign}`, "g");
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
          type: "str",
        });
      }
      if (result[1]) {
        list.push({
          start: result.index,
          count: result[0].length,
          type: "str",
          content: (
            <div key={prefix + key++} className={SelfStyle.codeWrapper}>
              <SyntaxHighlighter showLineNumbers>{result[1]}</SyntaxHighlighter>
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
        type: "str",
      });
    return list;
  }
  function dealLink(list: INoteAction[], base64imgs: Object) {
    //处理链接
    let prefix = "link",
      key = 0;
    const imgStuffixList = [".jpg", ".jpeg", ".gif", ".png", ".svg"];
    const linkPattern = RegExp(
      `(https?|ftp|file|${NNotes.imgProtocolKey})://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]`,
      "g"
    );

    const newList: INoteAction[] = [];
    list.forEach((item) => {
      if (typeof item.content === "string") {
        /*
          "a\n\n\n1".split("\n") => ["a", "", "", "1"] 
          单独的"" 可以被看做\n
          与原始字符串相比 是少了一个\n
          1\n2\n3 少了二个
        */
        let strList = item.content.split(/\n/);
        if (strList[strList.length - 1] === "") {
          //1\n2\n => ["1","2",""]  在下面的算法中会统一加\n 所以最后面这个会被多算
          strList.pop();
        }
        if (strList.length > 1) {
          //如果只有一行 加换行符不好处理
          strList = strList.map((str) => str + "\n");
        }

        let initalCount = item.start;
        strList.forEach((str) => {
          let type: TCopyType = "str";
          const id = props.data.id + "-" + prefix + "-" + key++;
          let result: RegExpExecArray | null,
            lastIndex = 0;

          let partList: ReactNode[] = [];
          let copyStr = "";
          if (str.match(linkPattern)) {
            //里面的元素应该被渲染为一行
            while ((result = linkPattern.exec(str)) !== null) {
              if (result.index !== lastIndex) {
                const content = str.substring(lastIndex, result.index);
                partList.push(content);
                copyStr += content;
              }
              const link = result[0];
              const isImg = imgStuffixList.some(
                (stuffix) => link.lastIndexOf(stuffix) !== -1
              );
              if (isImg) {
                //图片
                const isPaste = link.indexOf(NNotes.imgProtocolKey) === 0;
                let src: string;
                if (isPaste) {
                  //黏贴图片
                  src = base64imgs[link];
                  if (!src) {
                    //直接黏贴的协议，去其他笔记里找
                    const noteList = MDNotes.rsp.list;
                    for (let i = 0; i < noteList.length; i++) {
                      src = noteList[i].base64[link];
                      if (src) {
                        cloneData.base64[link] = src;
                        break;
                      }
                    }
                  }
                } else {
                  src = link;
                }
                copyStr += src;
                type = "img";
                partList.push(
                  <div
                    className={SelfStyle.imgWrapper}
                    onClick={() => props.zoomModalRef.current.showModal(src)}
                  >
                    <img id={id} key={id} src={src} alt="" />
                  </div>
                );
              } else {
                //普通链接
                copyStr += link;
                partList.push(
                  <a target="_blank" key={prefix + key++} href={link}>
                    {link}
                  </a>
                );
              }
              lastIndex = result.index + link.length;
            }
            if (lastIndex !== str.length) {
              const content = str.slice(lastIndex);

              if (content !== "\n") {
                copyStr += content + "\n";
              }
              partList.push(content);
            }
          } else {
            copyStr = str;
            partList.push(str);
          }
          newList.push({
            type,
            copyId: id,
            copyStr,
            start: initalCount,
            count: str.length,
            content: (
              <div className={SelfStyle.linkWrapper}>
                {partList.map((item, index) => {
                  let newItem = item;
                  if (typeof item === "string") {
                    newItem = <span>{item}</span>;
                  }

                  return <React.Fragment key={index}>{newItem}</React.Fragment>;
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
      content.substring(0, start) + content.substring(end, content.length);
    const newNote: NNotes = {
      ...props.data,
      content: newContent,
    };
    const res = await SNotes.editItem(newNote);
    if (res.success) {
      NModel.dispatch(
        new NMDNotes.ARSetRsp(
          NRsp.updateItem(
            MDNotes.rsp,
            newNote,
            (data) => data.id === newNote.id
          )
        )
      );
    }
  }
  function copyNoteContent(copyInfos: INoteAction) {
    if (copyInfos.type === "str") {
      UCopy.copyStr(copyInfos.copyStr);
    } else if (copyInfos.type === "img") {
      UCopy.copyImg(
        document.getElementById(copyInfos.copyId) as HTMLImageElement
      );
    }
  }
  function withAble(list: INoteAction[]) {
    //对每一个特殊元素块或一行赋予一些能力
    let prefix = "line",
      key = 0;
    const newList: ReactNode[] = [];

    list.forEach((item) => {
      newList.push(
        <div key={prefix + key++} className={SelfStyle.lineWrapper}>
          <div className="actions">
            <Space size="large">
              <a type="link" onClick={() => copyNoteContent(item)}>
                复制
              </a>
              <a type="link" onClick={() => reqDelPart(item.start, item.count)}>
                删除
              </a>
            </Space>
          </div>
          <div className="contents">{item.content || <span>&nbsp;</span>}</div>
        </div>
      );
    });
    return newList;
  }
};

export default NConnect.connect(({ MDNotes }: NModel.IState) => ({
  MDNotes,
}))(Note);
