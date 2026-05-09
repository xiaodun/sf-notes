import React, { useCallback, useEffect, useRef, useState } from "react";
import Note from "./components/note/note";
import SelfStyle from "./LNotes.less";
import SNotes from "./SNotes";
import { Button, message, Radio, Select, Modal, Spin } from "antd";
import {
  ArrowLeftOutlined,
  MenuOutlined,
  InboxOutlined,
} from "@ant-design/icons";
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
import UWsBridge from "@/common/utils/UWsBridge";
import wsEvent from "@/common/constants/wsEvent";

/** 移动端 getNoteList 分页大小（与接口 offset/limit 一致） */
const MOBILE_PAGE_SIZE = 4;

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
  const isMobile = Browser.isMobile();
  const editModalRef = useRef<IEditModal>();
  const zoomModalRef = useRef<IZoomImgModal>();
  const searchSelectRef = useRef<RefSelectProps>();
  const searchContentId = "search-content-id";
  const [searchKeyList, setSearchKeyList] = useState([]);
  const lastSerachKeyList = useRef([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isSortModel, setIsSortModel] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashList, setTrashList] = useState<NNotes[]>([]);
  const [restoringId, setRestoringId] = useState<string | undefined>();
  const [mobileNotesTotal, setMobileNotesTotal] = useState(0);
  const mobileNotesTotalRef = useRef(0);
  const [mobileListLoading, setMobileListLoading] = useState(false);
  const [mobileListLoadingMore, setMobileListLoadingMore] = useState(false);
  const loadMoreSentinelRef = useRef<HTMLDivElement>(null);
  const latestRspRef = useRef(MDNotes.rsp);
  const mobileAppendBusyRef = useRef(false);
  latestRspRef.current = MDNotes.rsp;
  mobileNotesTotalRef.current = mobileNotesTotal;

  useEffect(() => {
    setIsSortModel(MDNotes.isTitleModel && !isMobile);
  }, [MDNotes.isTitleModel, isMobile]);

  useEffect(() => {
    reqGetList();
    const off = UWsBridge.on(wsEvent.key.NOTE, () => {
      reqGetList();
    });
    setTimeout(() => {
      document.title = "日记本";
    });

    document.addEventListener("dragover", onDragOver);
    return () => {
      off();
      document.removeEventListener("dragover", onDragOver);
    };
  }, []);

  function normalizeNoteListColors(list: NNotes[] | undefined) {
    (list || []).forEach((item) => {
      if (!item.titleColor) {
        item.titleColor = "";
      }
    });
  }

  async function reqGetList() {
    if (isMobile) {
      await reqGetMobileListFirstPage();
      return;
    }
    const rsp = await SNotes.getList();
    if (rsp.success) {
      normalizeNoteListColors(rsp.list);
      setMobileNotesTotal(0);
      NModel.dispatch(new NMDNotes.ARSetRsp(rsp));
    }
  }

  async function reqGetMobileListFirstPage() {
    setMobileListLoading(true);
    mobileAppendBusyRef.current = false;
    try {
      const rsp = await SNotes.getList({
        offset: 0,
        limit: MOBILE_PAGE_SIZE,
      });
      if (rsp.success) {
        normalizeNoteListColors(rsp.list);
        const total =
          typeof rsp.total === "number"
            ? rsp.total
            : rsp.list?.length ?? 0;
        setMobileNotesTotal(total);
        NModel.dispatch(
          new NMDNotes.ARSetRsp({
            ...latestRspRef.current,
            ...rsp,
            list: rsp.list || [],
          }),
        );
      }
    } finally {
      setMobileListLoading(false);
    }
  }

  const reqAppendMobileListPage = useCallback(async () => {
    if (!isMobile || mobileAppendBusyRef.current) {
      return;
    }
    const prevListAtStart = latestRspRef.current.list || [];
    const offset = prevListAtStart.length;
    if (offset >= mobileNotesTotalRef.current) {
      return;
    }
    mobileAppendBusyRef.current = true;
    setMobileListLoadingMore(true);
    try {
      const rsp = await SNotes.getList({
        offset,
        limit: MOBILE_PAGE_SIZE,
      });
      if (!rsp.success) {
        return;
      }
      const chunk = rsp.list || [];
      if (!chunk.length) {
        setMobileNotesTotal(offset);
        return;
      }
      normalizeNoteListColors(chunk);
      if (typeof rsp.total === "number") {
        setMobileNotesTotal(rsp.total);
      }
      const merged = [...prevListAtStart, ...chunk];
      NModel.dispatch(
        new NMDNotes.ARSetRsp({
          ...latestRspRef.current,
          ...rsp,
          list: merged,
        }),
      );
    } finally {
      mobileAppendBusyRef.current = false;
      setMobileListLoadingMore(false);
    }
  }, [isMobile]);
  const noteList = MDNotes.rsp?.list || [];
  const titleOptionList = noteList
    .map((item) => ({
      value: item.title,
    }))
    .filter((item) => item.value);
  const matchIdList = getMatchIdList();
  const filteredNotes =
    matchIdList.length > 0
      ? noteList.filter((notes) => matchIdList.some((id) => notes.id === id))
      : noteList;
  const showMobileLoadMore =
    isMobile &&
    !mobileListLoading &&
    filteredNotes.length > 0 &&
    filteredNotes.length < mobileNotesTotal;

  useEffect(() => {
    if (
      typeof IntersectionObserver === "undefined" ||
      !showMobileLoadMore ||
      mobileListLoadingMore
    ) {
      return;
    }
    const el = loadMoreSentinelRef.current;
    if (!el) {
      return;
    }
    let io: IntersectionObserver | undefined;
    try {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries[0]?.isIntersecting) {
            return;
          }
          reqAppendMobileListPage();
        },
        { root: null, rootMargin: "320px", threshold: 0 },
      );
      io.observe(el);
    } catch {
      return;
    }
    return () => {
      io?.disconnect();
    };
  }, [
    showMobileLoadMore,
    filteredNotes.length,
    mobileNotesTotal,
    mobileListLoadingMore,
    reqAppendMobileListPage,
  ]);

  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      const newList = [...(MDNotes.rsp?.list || [])];
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
      <Spin spinning={isMobile && mobileListLoading}>
        {isSortModel && !isMobile && matchIdList.length === 0 ? (
          <SortableList
            items={noteList}
            onSortEnd={onSortEnd}
            editModalRef={editModalRef}
            zoomModalRef={zoomModalRef}
            isSortModel={isSortModel}
          />
        ) : (
          <>
            {filteredNotes.map((note) => {
              const index = noteList.findIndex((n) => n.id === note.id);
              return (
                <div key={note.id} className={SelfStyle.noteWrapper}>
                  <Note
                    data={note}
                    index={index < 0 ? 0 : index}
                    editModalRef={editModalRef}
                    zoomModalRef={zoomModalRef}
                    isSortModel={false}
                  ></Note>
                </div>
              );
            })}
            {showMobileLoadMore ? (
              <div
                ref={loadMoreSentinelRef}
                style={{ height: 24, marginBottom: 8 }}
                aria-hidden
              />
            ) : null}
            {isMobile && mobileListLoadingMore ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#999",
                  padding: "12px 0 24px",
                }}
              >
                加载中…
              </div>
            ) : null}
          </>
        )}
      </Spin>
      <EditModal
        onOk={reqGetList}
        ref={editModalRef}
        rsp={MDNotes.rsp}
      ></EditModal>
      <PageFooter>
        {!isMobile && (
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
        <Button icon={<InboxOutlined />} onClick={() => openTrashModal()}>
          回收站
        </Button>
        {!isMobile && (
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
        )}
      </PageFooter>
      <Modal
        title="回收站"
        visible={trashOpen}
        onCancel={() => setTrashOpen(false)}
        footer={[
          <Button
            key="clear"
            danger
            disabled={!trashList.length}
            onClick={() => onClearTrashConfirm()}
          >
            清空回收站
          </Button>,
          <Button key="close" type="primary" onClick={() => setTrashOpen(false)}>
            关闭
          </Button>,
        ]}
        width={Math.min(920, typeof window !== "undefined" ? window.innerWidth - 32 : 920)}
        bodyStyle={{ maxHeight: "70vh", overflow: "auto", paddingTop: 8 }}
        destroyOnClose
      >
        <Spin spinning={trashLoading}>
          {!trashList.length && !trashLoading ? (
            <div
              style={{
                color: "#999",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              暂无已删除备份
            </div>
          ) : (
            trashList.map((item, idx) => (
              <Note
                key={String(item.id)}
                data={item}
                index={idx}
                editModalRef={editModalRef}
                zoomModalRef={zoomModalRef}
                trashMode
                onRestore={() => onRestoreNote(String(item.id))}
                restoreLoading={restoringId === String(item.id)}
                restoreDisabled={
                  !!restoringId && restoringId !== String(item.id)
                }
              />
            ))
          )}
        </Spin>
      </Modal>
      <ZoomImgModal ref={zoomModalRef}></ZoomImgModal>
    </div>
  );
  async function openTrashModal() {
    setTrashOpen(true);
    await loadTrashList();
  }

  async function loadTrashList() {
    setTrashLoading(true);
    try {
      const rsp = await SNotes.getDeletedList();
      if (rsp.success && rsp.list) {
        setTrashList(rsp.list);
      } else {
        setTrashList([]);
      }
    } finally {
      setTrashLoading(false);
    }
  }

  async function onRestoreNote(id: string) {
    setRestoringId(id);
    try {
      const rsp = await SNotes.restoreItem(id);
      if (rsp.success) {
        message.success("已恢复到列表最前");
        await reqGetList();
        await loadTrashList();
      }
    } finally {
      setRestoringId(undefined);
    }
  }

  function onClearTrashConfirm() {
    Modal.confirm({
      title: "清空回收站？",
      content: "所有已删除备份将永久移除，无法找回。",
      okText: "清空",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        const rsp = await SNotes.clearDeletedNote();
        if (rsp.success) {
          message.success("已清空");
          setTrashList([]);
          await reqGetList();
          setTrashOpen(false);
        }
      },
    });
  }

  function getMatchIdList() {
    const rawList = MDNotes.rsp?.list || [];
    //名字标题的在前
    let matchTitleIdList = rawList
      .filter((notes) => {
        const title = notes.title ?? "";
        return searchKeyList.some(
          (key) =>
            key.indexOf(title) !== -1 || title.indexOf(key) !== -1,
        );
      })
      .map((notes) => notes.id);
    let matchContentIdList = rawList
      .filter((notes) => {
        const content = notes.content ?? "";
        return searchKeyList.some((key) => content.indexOf(key) !== -1);
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
