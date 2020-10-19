import React, { useEffect, useState, useRef } from 'react';
import Note from './components/note/note';
import NNotes from './NNotes';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import NRsp from '@/common/type/NRsp';
import { Button } from 'antd';
import EditModal, {
  IEditModalRef,
} from './components/edit/EditModal';
import ZoomImgModal, {
  IZoomImgModalRef,
} from './components/zoom/ZoomImgModal';
import { PageFooter } from '@/common/components/page';
export default () => {
  const [noteTsp, setNoteRsp] = useState<NRsp<NNotes>>({ list: [] });
  const [addPos, setAddPos] = useState<number>(null);
  const editModalRef = useRef<IEditModalRef>();
  const zoomModalRef = useRef<IZoomImgModalRef>();
  useEffect(() => {
    reqGetList();
    setTimeout(() => {
      document.title = '日记本';
    });

    document.addEventListener('dragover', onDragOver);
    return () => {
      document.removeEventListener('dragover', onDragOver);
    };
  }, []);
  function onDragOver(event: DragEvent) {
    const dataTransfer = event.dataTransfer;
    event.preventDefault();
    if (event.dataTransfer) {
      dataTransfer.dropEffect = 'none';
    }
  }
  function showZoomModal(src: string) {
    zoomModalRef.current.showModal(src);
  }
  function onAddNoteSuccess(notes: NNotes) {
    const newLists = NRsp.addItem(noteTsp, (newDataList) => {
      newDataList.splice(addPos, 0, notes);
      return newDataList;
    });
    setNoteRsp(newLists);
  }
  function onEditNoteSuccess(notes: NNotes) {
    const newLists = NRsp.updateItem(
      noteTsp,
      notes,
      (data) => data.id === notes.id,
    );
    setNoteRsp(newLists);
  }
  function onEditNote(data?: NNotes, index = 0) {
    setAddPos(index);
    editModalRef.current.showModal(data);
  }
  async function reqGetList() {
    const rsp = await SNotes.getList();
    if (rsp.success) {
      setNoteRsp(rsp);
    }
  }

  return (
    <div>
      {noteTsp.list.map((note, index) => (
        <div key={note.id} className={SelfStyle.noteWrapper}>
          <Note
            data={note}
            index={index}
            noteRsp={noteTsp}
            setNoteRsp={setNoteRsp}
            onEdit={onEditNote}
            showZoomModal={showZoomModal}
            onEditSuccess={onEditNoteSuccess}
          ></Note>
        </div>
      ))}
      <EditModal
        ref={editModalRef}
        onAddSuccess={onAddNoteSuccess}
        onEditSuccess={onEditNoteSuccess}
      ></EditModal>
      <PageFooter>
        <Button onClick={() => onEditNote()}>新建笔记</Button>
      </PageFooter>
      <ZoomImgModal ref={zoomModalRef}></ZoomImgModal>
    </div>
  );
};
