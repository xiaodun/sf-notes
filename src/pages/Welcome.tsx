import React, { useState, useEffect } from 'react';
import request from '@/utils/request';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Button, DatePicker, Modal } from 'antd';
export default () => {
  const [list, setList] = useState([]);
  const requestList = (seeds?: number) => {
    setTimeout(async () => {
      const response = await request.get('/api/notes/list', {
        params: {
          name: 12,
        },
      });
      setList(list.concat(response.list));
    }, seeds || 1500);
  };
  useEffect(() => {
    requestList(10);
  }, []);
  return (
    <div>
      <DatePicker.RangePicker></DatePicker.RangePicker>
      <Button onClick={() => requestList()}>开始</Button>
      <InfiniteScroll
        dataLength={list.length} //This is important field to render the next data
        next={requestList}
        hasMore={true}
        loader={
          <h4
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              position: 'fixed',
              width: '100%',
              height: '100%',
            }}>
            Loading...
          </h4>
        }>
        {list.map((item, index) => (
          <div style={{ height: 100 }} key={index}>
            {item.id}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};
