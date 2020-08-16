import React, { useEffect, useState } from 'react';
import Note from './components/note/PNote';
import TNotes from './TNotes';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import TRes from '@/common/type/TRes';
export default () => {
  const [lists, setLists] = useState<TRes.Lists<TNotes>>(
    new TRes.Lists(),
  );
  useEffect(() => {
    SNotes.getList().then((res) => {
      if (res.success) {
        setLists(TRes.asLists(res));
      }
    });
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
  return (
    <div>
      {lists.data.map((note) => (
        <div key={note.id} className={SelfStyle.noteWrapper}>
          <Note data={note} onDelItem={onDelItem}></Note>
        </div>
      ))}
    </div>
  );
};
