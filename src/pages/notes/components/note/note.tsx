import React, { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import SelfStyle from './note.less';
import { Card, Button, Menu, Dropdown, Space } from 'antd';
import {
  CopyOutlined,
  EditOutlined,
  CloseOutlined,
  EllipsisOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import NNotes from '../../NNotes';
import UCopy from '@/common/utils/UCopy';
import SNotes from '../../SNotes';
import NRsp from '@/common/namespace/NRsp';
import { classNames } from '@/common';
import { NMDNotes } from 'umi';
import NModel from '@/common/namespace/NModel';
import { IEditModal } from '../edit/EditModal';
import { IZoomImgModal } from '../zoom/ZoomImgModal';
import { NConnect } from '@/common/namespace/NConnect';
import { cloneDeep, debounce, isEqual } from 'lodash';
import Browser from '@/utils/browser';
import { produce } from 'immer';

type TCopyType = 'img' | 'str';
export interface INoteProps {
  data: NNotes;
  index: number;
  MDNotes: NMDNotes.IState;
  editModalRef: React.MutableRefObject<IEditModal>;
  zoomModalRef: React.MutableRefObject<IZoomImgModal>;
  dragHandle?: ReactNode;
  isSortModel?: boolean;
  /** 回收站：与主列表相同的正文渲染，禁用编辑/删除与自动保存 */
  trashMode?: boolean;
  onRestore?: () => void;
  restoreLoading?: boolean;
  /** 正在恢复其它条目时禁用本条的恢复按钮 */
  restoreDisabled?: boolean;
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

function resolveNotePasteImgSrc(
  link: string,
  noteBase64: Record<string, unknown>,
  otherNotes: NNotes[],
): string | undefined {
  if (link.indexOf(NNotes.imgProtocolKey) !== 0) {
    return link;
  }
  let src = noteBase64[link] as string | undefined;
  if (!src && otherNotes?.length) {
    for (let i = 0; i < otherNotes.length; i++) {
      const b = otherNotes[i]?.base64 as Record<string, string> | undefined;
      if (b?.[link]) {
        src = b[link];
        break;
      }
    }
  }
  return src;
}

function escapeHtmlForNoteClipboard(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttrForNoteClipboard(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 与 dealLink 一致：链接/内嵌图 → HTML 片段（保留行间文字与多图） */
function noteSegmentLinksToHtml(
  segment: string,
  noteBase64: Record<string, unknown>,
  otherNotes: NNotes[],
): string {
  const imgStuffixList = [
    '.jpg',
    '.jpeg',
    '.gif',
    '.png',
    '.svg',
    '.webp',
  ];
  const linkPattern = new RegExp(
    `((https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;\\u4e00-\\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\\u4e00-\\u9fa5])|(${NNotes.imgProtocolKey}://[.A-Za-z0-9]+)`,
    'g',
  );
  if (!segment.match(linkPattern)) {
    return escapeHtmlForNoteClipboard(segment)
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, '<br/>');
  }
  let html = '';
  let lastIndex = 0;
  let result: RegExpExecArray | null;
  const re = new RegExp(linkPattern.source, linkPattern.flags);
  while ((result = re.exec(segment)) !== null) {
    if (result.index !== lastIndex) {
      html += escapeHtmlForNoteClipboard(
        segment.slice(lastIndex, result.index),
      )
        .replace(/\r\n/g, '\n')
        .replace(/\n/g, '<br/>');
    }
    const link = result[0];
    const isImg = imgStuffixList.some(
      (stuffix) => link.lastIndexOf(stuffix) !== -1,
    );
    if (isImg) {
      const src = resolveNotePasteImgSrc(link, noteBase64, otherNotes);
      if (src) {
        html += `<img alt="" style="max-width:100%;max-height:480px;vertical-align:middle;display:block;margin:6px 0" src="${escapeAttrForNoteClipboard(src)}" />`;
      } else {
        html += escapeHtmlForNoteClipboard(link);
      }
    } else {
      html += `<a href="${escapeAttrForNoteClipboard(link)}">${escapeHtmlForNoteClipboard(link)}</a>`;
    }
    lastIndex = result.index + link.length;
  }
  if (lastIndex < segment.length) {
    html += escapeHtmlForNoteClipboard(segment.slice(lastIndex))
      .replace(/\r\n/g, '\n')
      .replace(/\n/g, '<br/>');
  }
  return html;
}

function buildNoteTopCopyHtml(
  content: string,
  note: NNotes,
  otherNotes: NNotes[],
): string {
  const noteBase64 = (note.base64 || {}) as Record<string, unknown>;
  const codeRe = /```([\s\S]*?)```/g;
  const parts: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = codeRe.exec(content)) !== null) {
    if (m.index > last) {
      parts.push(
        noteSegmentLinksToHtml(
          content.slice(last, m.index),
          noteBase64,
          otherNotes,
        ),
      );
    }
    parts.push(
      `<pre style="white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:12px;">${escapeHtmlForNoteClipboard(m[1] || '')}</pre>`,
    );
    last = m.index + m[0].length;
  }
  if (last < content.length) {
    parts.push(
      noteSegmentLinksToHtml(
        content.slice(last),
        noteBase64,
        otherNotes,
      ),
    );
  }
  if (parts.length === 0) {
    parts.push(noteSegmentLinksToHtml(content, noteBase64, otherNotes));
  }
  const body = parts.join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.55">${body}</div></body></html>`;
}

/**
 * 纯文本：保留原文与换行，内嵌图用【图片】占位（不塞 data URL），便于在记事本里阅读顺序。
 * 代码块内不替换。
 */
function buildNoteStructuredPlainForClipboard(
  content: string,
  note: NNotes,
  otherNotes: NNotes[],
): string {
  const noteBase64 = (note.base64 || {}) as Record<string, unknown>;
  const keyRe = new RegExp(
    `${NNotes.imgProtocolKey}://[.A-Za-z0-9]+`,
    'g',
  );
  function replaceImgKeys(seg: string): string {
    return seg.replace(keyRe, (link) => {
      const src = resolveNotePasteImgSrc(link, noteBase64, otherNotes);
      return src ? '【图片】' : link;
    });
  }
  let out = '';
  let last = 0;
  const codeRe = /```([\s\S]*?)```/g;
  let m: RegExpExecArray | null;
  while ((m = codeRe.exec(content)) !== null) {
    if (m.index > last) {
      out += replaceImgKeys(content.slice(last, m.index));
    }
    out += m[0];
    last = m.index + m[0].length;
  }
  if (last < content.length) {
    out += replaceImgKeys(content.slice(last));
  }
  if (out === '') {
    out = replaceImgKeys(content);
  }
  return out;
}

function samePersistedNoteBody(a: NNotes, b: NNotes): boolean {
  return (
    a.id === b.id &&
    a.content === b.content &&
    isEqual(a.base64 ?? {}, b.base64 ?? {})
  );
}

const Note: FC<INoteProps> = (props) => {
  const { data, MDNotes, trashMode } = props;
  const [localDraft, setLocalDraft] = useState<NNotes | null>(null);
  const effectiveData = localDraft ?? data;
  const cloneData = cloneDeep(effectiveData);

  const mdNotesRspRef = useRef(MDNotes.rsp);
  mdNotesRspRef.current = MDNotes.rsp;

  const localDraftRef = useRef<NNotes | null>(null);
  useEffect(() => {
    localDraftRef.current = localDraft;
  }, [localDraft]);

  const trashModeRef = useRef(trashMode);
  useEffect(() => {
    trashModeRef.current = trashMode;
  }, [trashMode]);

  /** dealLink 与 effective 不一致时自动落库；有 localDraft（片段删除批处理中）时不触发，避免抢写 */
  const persistDraftDebounced = useMemo(
    () =>
      debounce((draft: NNotes) => {
        SNotes.editItem(draft).then((rsp) => {
          if (rsp.success) {
            const newNotesRsp = NRsp.updateItem(
              mdNotesRspRef.current,
              draft,
              (d) => d.id === draft.id,
            );
            NModel.dispatch(new NMDNotes.ARSetRsp(newNotesRsp));
          }
        });
      }, 420),
    [data.id],
  );

  const runFlushDeleteBatchRef = useRef<() => Promise<void>>(async () => {});

  runFlushDeleteBatchRef.current = async () => {
    const draft = localDraftRef.current;
    if (!draft || trashModeRef.current) {
      return;
    }
    persistDraftDebounced.cancel();
    const res = await SNotes.editItem(draft);
    if (!res.success) {
      return;
    }
    const stored = (res.data as NNotes) ?? draft;
    NModel.dispatch(
      new NMDNotes.ARSetRsp(
        NRsp.updateItem(
          mdNotesRspRef.current,
          stored,
          (d) => d.id === stored.id,
        ),
      ),
    );
    const cur = localDraftRef.current;
    if (!cur) {
      return;
    }
    if (samePersistedNoteBody(cur, stored)) {
      localDraftRef.current = null;
      setLocalDraft(null);
      return;
    }
    void runFlushDeleteBatchRef.current();
  };

  const scheduleDeleteFlushDebounced = useMemo(
    () => debounce(() => void runFlushDeleteBatchRef.current(), 420),
    [data.id],
  );

  useEffect(
    () => () => {
      persistDraftDebounced.cancel();
      scheduleDeleteFlushDebounced.cancel();
    },
    [persistDraftDebounced, scheduleDeleteFlushDebounced],
  );

  useEffect(() => {
    setLocalDraft(null);
    scheduleDeleteFlushDebounced.cancel();
  }, [data.id, scheduleDeleteFlushDebounced]);

  const isExpand = trashMode
    ? true
    : MDNotes.noteSettingObjs[data.id]?.isExpand ?? false;
  return (
    <div style={{ marginBottom: 20 }}>
      {MDNotes.isTitleModel && !isExpand && !trashMode ? (
        <Card
          size="small"
          title={getTitle(data.title)}
          style={{ backgroundColor: data.titleColor }}
          className={classNames(SelfStyle.titleModel)}
          bodyStyle={{ display: "none", padding: 0 }}
          extra={
            <Space>
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
            </Space>
          }
        ></Card>
      ) : (
        <>
          {!trashMode && renderActionWrap(SelfStyle.top, data.titleColor)}
          <div className={SelfStyle.noteWrapper}>
            <Card
              size="small"
              title={getTitle(data.title)}
              extra={
                trashMode ? (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      loading={props.restoreLoading}
                      disabled={props.restoreDisabled}
                      onClick={() => props.onRestore?.()}
                    >
                      恢复
                    </Button>
                  </Space>
                ) : (
                  <Space>
                    {MDNotes.isTitleModel && (
                      <>
                        {isExpand ? (
                          <Button
                            onClick={() => {
                              NModel.dispatch(
                                new NMDNotes.ArChangeNoteExpand({
                                  id: data.id,
                                  isExpand: false,
                                }),
                              );
                            }}
                          >
                            收起
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              NModel.dispatch(
                                new NMDNotes.ArChangeNoteExpand({
                                  id: data.id,
                                  isExpand: true,
                                }),
                              );
                            }}
                          >
                            展开
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      onClick={() => {
                        onCopy();
                        reqDelItem(data.id);
                      }}
                      icon={<CloseOutlined></CloseOutlined>}
                    ></Button>
                  </Space>
                )
              }
            >
              {parseContent(effectiveData.content, effectiveData.base64)}
            </Card>
          </div>
          {!trashMode && renderActionWrap(SelfStyle.bottom)}
        </>
      )}
    </div>
  );
  function getTitle(title: string) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          userSelect: "none",
        }}
      >
        {props.isSortModel && (
          <span style={{ marginRight: 8, cursor: "grab" }}>
            <MenuOutlined />
          </span>
        )}
        <div onClick={() => UCopy.copyStr(title)} style={{ flex: 1 }}>
          {title}
        </div>
      </div>
    );
  }
  function onUpdateNote(data: NNotes) {
    props.editModalRef.current.showModal(data);
  }
  function onAddNote(index: number) {
    props.editModalRef.current.showModal(null, index);
  }
  function renderActionWrap(className: any, titleColor?: string) {
    return (
      <div
        style={{ backgroundColor: titleColor }}
        className={classNames(
          SelfStyle.actionWrap,
          { [SelfStyle.mobile]: Browser.isMobile() },
          className,
        )}
      >
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
          <Dropdown menu={{ items: [
            {
              key: 'noitce_top',
              label: '置顶',
              onClick: () => reqTopItem(data)
            },
            {
              key: 'noitce_bottom', 
              label: '置后',
              onClick: () => reqBottomItem(data)
            },
            {
              type: 'divider'
            },
            {
              key: 'add_up',
              label: '向上添加',
              onClick: () => onAddNote(props.index)
            },
            {
              key: 'add_down',
              label: '向下添加', 
              onClick: () => onAddNote(props.index + 1)
            }
          ] }} placement="top">
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
          NRsp.delItem(MDNotes.rsp, (item) => item.id === id),
        ),
      );
    }
  }
  /**
   * 剪贴板同时带 text/html（多图+排版）与 text/plain（正文+【图片】占位），避免仅 HTML 时微信等粘贴为空。
   * 勿用 async/await 排在 clipboard.write 前，以免丢失用户手势。
   */
  function onCopy() {
    const raw = data.content ?? '';
    const list = MDNotes.rsp?.list ?? [];
    const structured = buildNoteStructuredPlainForClipboard(raw, data, list);
    const plain = structured.trim().length ? structured : raw;
    const html = buildNoteTopCopyHtml(raw, data, list);
    void UCopy.copyHtmlPlain(html, plain);
  }
  async function reqTopItem(data: NNotes) {
    const rsp = await SNotes.topItem(data);
    if (rsp.success) {
      NModel.dispatch(
        new NMDNotes.ARSetRsp(NRsp.changePos(MDNotes.rsp, data, 0)),
      );
    }
  }
  async function reqBottomItem(data: NNotes) {
    const rsp = await SNotes.bottomItem(data);
    if (rsp.success) {
      NModel.dispatch(
        new NMDNotes.ARSetRsp(
          NRsp.changePos(
            MDNotes.rsp,
            data,
            MDNotes.rsp.list.length - 1,
          ),
        ),
      );
    }
  }
  function parseContent(content: string = '', base64imgs: Object) {
    let list = dealCode(content);
    list = dealLink(list, base64imgs);
    if (!trashMode && localDraft === null && !isEqual(effectiveData, cloneData)) {
      persistDraftDebounced(cloneDeep(cloneData));
    }
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
          type: 'str',
        });
      }
      if (result[1]) {
        list.push({
          start: result.index,
          count: result[0].length,
          type: 'str',
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
        type: 'str',
      });
    return list;
  }
  function dealLink(list: INoteAction[], base64imgs: Object) {
    //处理链接
    let prefix = 'link',
      key = 0;
    const imgStuffixList = [
      '.jpg',
      '.jpeg',
      '.gif',
      '.png',
      '.svg',
      '.webp',
    ];
    const linkPattern = RegExp(
      `((https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5])|(${NNotes.imgProtocolKey}://[.A-Za-z0-9]+)`,
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
          let type: TCopyType = 'str';
          const id = effectiveData.id + '-' + prefix + '-' + key++;
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
                  link.indexOf(NNotes.imgProtocolKey) === 0;
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
                type = 'img';
                partList.push(
                  <div
                    className={SelfStyle.imgWrapper}
                    onClick={() =>
                      props.zoomModalRef.current.showModal(src)
                    }
                  >
                    <img id={id} key={id} src={src} alt="" />
                  </div>,
                );
              } else {
                //普通链接
                copyStr += link;
                //限制一下长度
                const showLen = 60;
                let showLinkStr =
                  link.length > showLen
                    ? link.substring(0, showLen) + '...'
                    : link;
                partList.push(
                  <a target="_blank" key={prefix + key++} href={link}>
                    {showLinkStr}
                  </a>,
                );
              }
              lastIndex = result.index + link.length;
            }
            if (lastIndex !== str.length) {
              const content = str.slice(lastIndex);

              if (content !== '\n') {
                copyStr += content + '\n';
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
    const base = localDraftRef.current ?? data;
    const content = base.content;
    const end = start + count;
    const newContent =
      content.substring(0, start) +
      content.substring(end, content.length);

    const newNote: NNotes = produce(base, (drafState) => {
      drafState.content = newContent;
      const delContent = content.substring(start, end).trim();
      if (delContent.startsWith(NNotes.imgProtocolKey)) {
        delete drafState.base64[delContent];
      }
    });

    if (trashMode) {
      return;
    }
    setLocalDraft(newNote);
    localDraftRef.current = newNote;
    persistDraftDebounced.cancel();
    scheduleDeleteFlushDebounced();
  }
  function copyNoteContent(copyInfos: INoteAction) {
    if (copyInfos.type === 'str') {
      UCopy.copyStr(copyInfos.copyStr.trim());
    } else if (copyInfos.type === 'img') {
      UCopy.copyImg(
        document.getElementById(copyInfos.copyId) as HTMLImageElement,
      );
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
            <Space size="small">
              <Button
                type="link"
                size="small"
                onClick={() => copyNoteContent(item)}
                style={{ padding: 0 }}
              >
                复制
              </Button>
              {!trashMode && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    copyNoteContent(item);
                    reqDelPart(item.start, item.count);
                  }}
                  style={{ padding: 0 }}
                >
                  删除
                </Button>
              )}
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

export default NConnect.connect(({ MDNotes }: NModel.IState) => ({
  MDNotes,
}))(Note);
