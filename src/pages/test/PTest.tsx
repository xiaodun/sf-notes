import { useEffect } from 'react';
import React from 'react';
import TestHook from './components/TestHook';
import TestClass from './components/TestClass';
import { Button } from 'antd';

export default () => {
  return (
    <div>
      <Button type="link" href="/test.html">
        跳转到用于测试的html页面
      </Button>
      <TestHook num={1}></TestHook>
      <TestClass></TestClass>
    </div>
  );
};
