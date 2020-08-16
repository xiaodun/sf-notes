import React, { useEffect, useState } from 'react';
import Note from './components/note/PNote';
import TNotes from './TNotes';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import TRes from '@/common/type/TRes';
import { PageFooter } from '@/common/components';
import { Button } from 'antd';
export default () => {
  const [lists, setLists] = useState<TRes.Lists<TNotes>>(
    new TRes.Lists(),
  );
  useEffect(() => {
    reqGetList();
  }, []);
  function onDelItem(id: string) {
    reqDelItem(id);
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
      <PageFooter>
        <Button>新建笔记</Button>
      </PageFooter>
    </div>
  );
};
