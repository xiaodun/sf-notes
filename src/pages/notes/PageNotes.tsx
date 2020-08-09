import React, { useEffect, useState } from 'react';
import Note from './components/note/note';
import { ServiceNotes } from './ServiceNotes';
import { PageList } from '@/common/type/TypeCommon';
import { TypeNotes } from './TypeNotes';
import SelfStyle from './PageNotes.less';
export default () => {
  const [pageList, setPageList] = useState<
    PageList<ServiceNotes.Item>
  >(new PageList());
  useEffect(() => {
    ServiceNotes.getList().then((res) => {
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
