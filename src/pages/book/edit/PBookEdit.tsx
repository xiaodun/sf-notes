import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDBook, NMDGlobal } from "umi";
import { Button, Input } from "antd";
import SelfStyle from "./PBookEdit.less";
import NModel from "@/common/namespace/NModel";
import qs from "qs";
import NBook from "../NBook";
import { debounce } from "lodash";
import SBook from "../SBook";
import useRefreshView from "@/common/hooks/useRefreshView";
export interface IPBookEditProps {
  MDGlobal: NMDGlobal.IState;
  MDBook: NMDBook.IState;
}
const PBookEdit: ConnectRC<IPBookEditProps> = (props) => {
  const refreshView = useRefreshView();
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as NBook.IUrlQuery;
  const infos = useRef(getEditInfos()).current;
  const contentParams = useRef({
    id: urlQuery.id as string,
    updateType: infos.updateType,
    title: "",
    content: "",
  }).current;
  useEffect(() => {
    reqGetBook();
    document.getElementById("editTextArea").focus();
  }, []);
  const reqUpdateBookContent = useRef(
    debounce(async function () {
      await SBook.updateBookContent(contentParams);
    }, 500)
  ).current;
  return (
    <div className={SelfStyle.main}>
      <div className={SelfStyle.header}>
        <Button type="primary">内容列表</Button>
        <Button>设置界面</Button>
      </div>
      <Input
        value={contentParams.title}
        onChange={(e) =>
          onUpdateBookContent({
            title: e.target.value,
          })
        }
        className={SelfStyle.titleBlock}
        placeholder={infos.titlePlaceholder}
      />
      <Input.TextArea
        value={contentParams.content}
        id="editTextArea"
        onChange={(e) =>
          onUpdateBookContent({
            content: e.target.value,
          })
        }
        placeholder={infos.contentPlaceholder}
        className={SelfStyle.chapterBlock}
      ></Input.TextArea>
    </div>
  );
  async function reqGetBook() {
    const rsp = await SBook.getBook({
      id: urlQuery.id,
      updateType: infos.updateType,
    });
    NModel.dispatch(new NMDBook.ARSetBook(rsp.data));

    contentParams.title = rsp.data.title;
    contentParams.content = rsp.data.content;
    refreshView();
  }
  function onUpdateBookContent(data: Partial<NBook.IContent>) {
    Object.assign(contentParams, data);
    refreshView();
    reqUpdateBookContent();
  }

  function getEditInfos() {
    let infos: {
      updateType: NBook.TUpdaeType;
      [key: string]: string;
    } = {
      titlePlaceholder: "书籍名称",
      contentPlaceholder: "书籍介绍",
      updateType: "book",
    };
    if (urlQuery.prefaceId) {
      infos.titlePlaceholder = "序言标题";
      infos.contentPlaceholder = "序言内容";
      infos.updateType = "preface";
    } else if (urlQuery.chapterId) {
      infos.titlePlaceholder = "章节标题";
      infos.contentPlaceholder = "章节内容";
      infos.updateType = "chapter";
    } else if (urlQuery.epilogId) {
      infos.titlePlaceholder = "结尾标题";
      infos.contentPlaceholder = "结尾内容";
      infos.updateType = "epilog";
    }
    return infos;
  }
};
export default connect(({ MDGlobal, MDBook }: NModel.IState) => ({
  MDGlobal,
  MDBook,
}))(PBookEdit);
