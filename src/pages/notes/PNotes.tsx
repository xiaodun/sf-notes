import React, { useEffect, useState, useRef } from 'react';
import Note from './components/note/note';
import TNotes from './TNotes';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import TRes from '@/common/type/TRes';
import { PageFooter } from '@/common/components';
import { Button } from 'antd';
import EditModal, {
  EditModal as EditModalDef,
  IEditModalRef,
} from './components/edit/EditModal';
export default () => {
  const [lists, setLists] = useState<TRes.Lists<TNotes>>(
    new TRes.Lists(),
  );
  const editModalRef = useRef<IEditModalRef>();
  useEffect(() => {
    reqGetList();
  }, []);
  function onDelItem(id: string) {
    reqDelItem(id);
  }
  function onAddNote() {
    editModalRef.current.showModal(true);
  }
  async function reqDelItem(id: string) {
    const res = await SNotes.delItem(id);
    if (res.success) {
      setLists(TRes.delItem(lists, (item) => item.id === id));
    }
  }
  async function reqGetList() {
    const res = await SNotes.getList();
    if (res.success) {
      setLists(TRes.asLists(res));
    }
  }
  return (
    <div>
      {lists.data.map((note) => (
        <div key={note.id} className={SelfStyle.noteWrapper}>
          <Note data={note} onDelItem={onDelItem}></Note>
        </div>
      ))}
      <EditModal ref={editModalRef}></EditModal>
      <PageFooter>
        <Button onClick={onAddNote}>新建笔记</Button>
      </PageFooter>
    </div>
  );
};
