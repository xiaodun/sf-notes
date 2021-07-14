import React, { useEffect, useRef, useState } from "react";
import Note from "./components/note/note";
import SelfStyle from "./LNotes.less";
import SNotes from "./SNotes";
import { Button, Radio, Select } from "antd";
import { RefSelectProps } from "antd/lib/select";
import EditModal, { IEditModal } from "./components/edit/EditModal";
import ZoomImgModal, { IZoomImgModal } from "./components/zoom/ZoomImgModal";
import { PageFooter } from "@/common/components/page";
import { connect } from "dva";
import NModel from "@/common/namespace/NModel";
import { ConnectRC, NMDNotes } from "umi";
import { uniq, isEqual } from "lodash";
export interface PNotesProps {
  MDNotes: NMDNotes.IState;
}
const PNotes: ConnectRC<PNotesProps> = (props) => {
  const { MDNotes } = props;
  const editModalRef = useRef<IEditModal>();
  const zoomModalRef = useRef<IZoomImgModal>();
  const searchSelectRef = useRef<RefSelectProps>();
  const searchContentId = "search-content-id";
  const [searchKeyList, setSearchKeyList] = useState([]);
  const lastSerachKeyList = useRef([]);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    reqGetList();
    setTimeout(() => {
      document.title = "日记本";
    });

    document.addEventListener("dragover", onDragOver);
    return () => {
      document.removeEventListener("dragover", onDragOver);
    };
  }, []);

  async function reqGetList() {
    const rsp = await SNotes.getList();
    if (rsp.success) {
      NModel.dispatch(new NMDNotes.ARSetRsp(rsp));
    }
  }
  const titleOptionList = MDNotes.rsp.list
    .map((item) => ({
      value: item.title,
    }))
    .filter((item) => item.value);
  const matchIdList = getMatchIdList();
  return (
    <div>
      {MDNotes.rsp.list
        .filter((notes) =>
          matchIdList.length > 0
            ? matchIdList.some((id) => notes.id === id)
            : true
        )
        .map((note, index) => (
          <div key={note.id} className={SelfStyle.noteWrapper}>
            <Note
              data={note}
              index={index}
              editModalRef={editModalRef}
              zoomModalRef={zoomModalRef}
            ></Note>
          </div>
        ))}
      <EditModal ref={editModalRef} rsp={MDNotes.rsp}></EditModal>
      <PageFooter>
        <Button onClick={() => onAddNote()}>新建笔记</Button>
        <Radio.Group value={MDNotes.isTitleModel} buttonStyle="solid">
          <Radio.Button value={true} onClick={onToggleShowModel}>
            标题模式
          </Radio.Button>
        </Radio.Group>
        <div id={searchContentId}>
          <Select
            ref={searchSelectRef}
            className={SelfStyle.searchSelect}
            getPopupContainer={() => document.getElementById(searchContentId)}
            mode="tags"
            allowClear={true}
            placeholder="搜索内容"
            onChange={onSearchContent}
            open={searchOpen}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
          >
            {titleOptionList.map((item, index) => (
              <Select.Option key={index} value={item.value}>
                {item.value}
              </Select.Option>
            ))}
          </Select>
        </div>
      </PageFooter>
      <ZoomImgModal ref={zoomModalRef}></ZoomImgModal>
    </div>
  );
  function getMatchIdList() {
    //名字标题的在前
    let matchTitleIdList = MDNotes.rsp.list
      .filter((notes) => {
        return searchKeyList.some(
          (key) =>
            key.indexOf(notes.title) !== -1 || notes.title.indexOf(key) !== -1
        );
      })
      .map((notes) => notes.id);
    let matchContentIdList = MDNotes.rsp.list
      .filter((notes) => {
        return searchKeyList.some((key) => notes.content.indexOf(key) !== -1);
      })
      .map((notes) => notes.id);
    const idList = uniq([...matchTitleIdList, ...matchContentIdList]);
    if (idList.length > 0 && !isEqual(lastSerachKeyList.current, idList)) {
      setTimeout(() => {
        setSearchOpen(false);
        setTimeout(() => {
          setSearchOpen(true);
        });
      });
    }
    lastSerachKeyList.current = idList;
    return idList;
  }

  function onSearchContent(value: string[]) {
    setSearchKeyList(value);
  }
  function onDragOver(event: DragEvent) {
    const dataTransfer = event.dataTransfer;
    event.preventDefault();
    if (event.dataTransfer) {
      dataTransfer.dropEffect = "none";
    }
  }
  function onAddNote() {
    editModalRef.current.showModal(null, 0);
  }
  function onToggleShowModel() {
    if (MDNotes.isTitleModel) {
      NModel.dispatch(new NMDNotes.ARSetTitleModel(false));
      NModel.dispatch(new NMDNotes.ArChangeAllNoteExpand(false));
    } else {
      NModel.dispatch(new NMDNotes.ARSetTitleModel(true));
    }
  }
};

export default connect(({ MDNotes }: NModel.IState) => ({
  MDNotes,
}))(PNotes);
