import React, { useEffect, useState } from 'react';
import Note from './components/note/note';
import { TNotes } from './TNotes';
import SelfStyle from './LNotes.less';
import SNotes from './SNotes';
import TRes from '@/common/type/TResponse';
export default () => {
  const [pageList, setPageList] = useState<TRes.List<TNotes.Item>>(
    new TRes.List(),
  );
  useEffect(() => {
    SNotes.getList().then((res) => {
      if (res.success) {
        setPageList(res.data);
      }
    });
  }, []);
  return (
    <div>
      {pageList.dataSource.map((note) => (
        <div key={note.id} className={SelfStyle.noteWrapper}>
          <Note data={note}></Note>
        </div>
      ))}
    </div>
  );
};
