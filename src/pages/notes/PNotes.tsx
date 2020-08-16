import React, { useEffect, useState } from 'react';
import Note from './components/note/PNote';
import TNotes from './TNotes';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import TRes from '@/common/type/TResponse';
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
  return (
    <div>
      {lists.data.map((note) => (
        <div key={note.id} className={SelfStyle.noteWrapper}>
          <Note data={note}></Note>
        </div>
      ))}
    </div>
  );
};
