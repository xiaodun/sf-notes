import React, { useEffect, useRef, useState } from "react";
import Note from "./components/note/note";
import SelfStyle from "./LNotes.less";
import SNotes from "./SNotes";
import { Button, message, Radio, Select } from "antd";
import { ArrowLeftOutlined, MenuOutlined } from "@ant-design/icons";
import { RefSelectProps } from "antd/lib/select";
import EditModal, { IEditModal } from "./components/edit/EditModal";
import ZoomImgModal, { IZoomImgModal } from "./components/zoom/ZoomImgModal";
import { PageFooter } from "@/common/components/page";
import { connect } from "dva";
import NModel from "@/common/namespace/NModel";
import { ConnectRC, NMDNotes, history } from "umi";
import { uniq, isEqual } from "lodash";
import Browser from "@/utils/browser";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
  SortEnd,
} from "react-sortable-hoc";
import NNotes from "./NNotes";

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
));

const SortableItem = SortableElement(
    ({
      value,
      sortIndex,
      editModalRef,
      zoomModalRef,
      isSortModel,
    }: {
      value: NNotes;
      sortIndex: number;
      editModalRef: React.MutableRefObject<IEditModal>;
      zoomModalRef: React.MutableRefObject<IZoomImgModal>;
      isSortModel: boolean;
    }) => (
      <div className={SelfStyle.noteWrapper}>
        <Note
          data={value}
          index={sortIndex}
          editModalRef={editModalRef}
          zoomModalRef={zoomModalRef}
          dragHandle={isSortModel ? <DragHandle /> : undefined}
          isSortModel={isSortModel}
        ></Note>
      </div>
    )
  );
const SortableList = SortableContainer(
  ({
    items,
    editModalRef,
    zoomModalRef,
    isSortModel,
  }: {
    items: NNotes[];
    editModalRef: React.MutableRefObject<IEditModal>;
    zoomModalRef: React.MutableRefObject<IZoomImgModal>;
    isSortModel: boolean;
  }) => {
    return (
      <div>
        {items.map((value, index) => (
          <SortableItem
            key={value.id}
            index={index}
            value={value}
            sortIndex={index}
            editModalRef={editModalRef}
            zoomModalRef={zoomModalRef}
            isSortModel={isSortModel}
          />
        ))}
      </div>
    );
  }
);

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
  const [isSortModel, setIsSortModel] = useState(false);
  useEffect(() => {
    setIsSortModel(MDNotes.isTitleModel);
  }, [MDNotes.isTitleModel]);

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
      rsp.list.forEach((item) => {
        if (!item.titleColor) {
          item.titleColor = "";
        }
      });
      NModel.dispatch(new NMDNotes.ARSetRsp(rsp));
    }
  }
  const titleOptionList = MDNotes.rsp.list
    .map((item) => ({
      value: item.title,
    }))
    .filter((item) => item.value);
  const matchIdList = getMatchIdList();

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newList = [...MDNotes.rsp.list];
      const [movedItem] = newList.splice(oldIndex, 1);
      newList.splice(newIndex, 0, movedItem);

      const newRsp = { ...MDNotes.rsp, list: newList };
      NModel.dispatch(new NMDNotes.ARSetRsp(newRsp));

      SNotes.sortNoteList(oldIndex, newIndex).then((rsp) => {
        if (!rsp.success) {
          reqGetList();
        }
      });
    }
  };
  return (
    <div>
      {matchIdList.length > 0 ? (
        MDNotes.rsp.list
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
          ))
      ) : isSortModel ? (
        <SortableList
          items={MDNotes.rsp.list}
          onSortEnd={onSortEnd}
          editModalRef={editModalRef}
          zoomModalRef={zoomModalRef}
          isSortModel={isSortModel}
        />
      ) : (
        MDNotes.rsp.list.map((note, index) => (
          <div key={note.id} className={SelfStyle.noteWrapper}>
            <Note
              data={note}
              index={index}
              editModalRef={editModalRef}
              zoomModalRef={zoomModalRef}
              isSortModel={isSortModel}
            ></Note>
          </div>
        ))
      )}
      <EditModal
        onOk={reqGetList}
        ref={editModalRef}
        rsp={MDNotes.rsp}
      ></EditModal>
      <PageFooter>
        {!Browser.isMobile() && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push("/")}
          >
            返回
          </Button>
        )}
        <Button onClick={() => onAddNote()}>新建笔记</Button>

        <Radio.Group value={MDNotes.isTitleModel} buttonStyle="solid">
          <Radio.Button value={true} onClick={onToggleShowModel}>
            标题模式
          </Radio.Button>
        </Radio.Group>

        {!Browser.isMobile() && (
          <>
            <div id={searchContentId}>
              <Select
                ref={searchSelectRef}
                className={SelfStyle.searchSelect}
                getPopupContainer={() =>
                  document.getElementById(searchContentId)
                }
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
            <Button onClick={() => onClearDeletedNote()}>清空删除备份</Button>
          </>
        )}
      </PageFooter>
      <ZoomImgModal ref={zoomModalRef}></ZoomImgModal>
    </div>
  );
  async function onClearDeletedNote() {
    const rsp = await SNotes.clearDeletedNote();
    if (rsp.success) {
      message.success("已清空");
    }
  }
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
