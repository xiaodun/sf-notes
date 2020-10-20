import React, { useEffect, useRef } from 'react';
import Note from './components/note/note';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import { Button } from 'antd';
import EditModal, { IEditModal } from './components/edit/EditModal';
import ZoomImgModal, {
  IZoomImgModal,
} from './components/zoom/ZoomImgModal';
import { PageFooter } from '@/common/components/page';
import { connect } from 'dva';
import NModel from '@/common/type/NModel';
import { ConnectRC, NMDNotes } from 'umi';
export interface PNotesProps {
  MDNotes: NMDNotes.IState;
}
const PNotes: ConnectRC<PNotesProps> = (props) => {
  const { MDNotes } = props;
  const editModalRef = useRef<IEditModal>();
  const zoomModalRef = useRef<IZoomImgModal>();
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
  function onAddNote() {
    editModalRef.current.showModal(null, 0);
  }
  async function reqGetList() {
    const rsp = await SNotes.getList();
    if (rsp.success) {
      NModel.dispatch(new NMDNotes.ARSetRsp(rsp));
    }
  }

  return (
    <div>
      {MDNotes.rsp.list.map((note, index) => (
        <div key={note.id} className={SelfStyle.noteWrapper}>
          <Note
            data={note}
            index={index}
            editModal={editModalRef.current}
            zoomModal={zoomModalRef.current}
          ></Note>
        </div>
      ))}
      <EditModal ref={editModalRef} rsp={MDNotes.rsp}></EditModal>
      <PageFooter>
        <Button onClick={() => onAddNote()}>新建笔记</Button>
      </PageFooter>
      <ZoomImgModal ref={zoomModalRef}></ZoomImgModal>
    </div>
  );
};

export default connect(({ MDNotes }: NModel.IState) => ({
  MDNotes,
}))(PNotes);
