import { useEffect } from 'react';
import React from 'react';
import TestHook from './components/TestHook';
import TestClass from './components/TestClass';

export default () => {
  useEffect(() => {
    setTimeout(() => {
      document.title = '测试页';
    });
  }, []);
  return (
    <div>
      {/* <TestHook num={1}></TestHook> */}
      <TestClass></TestClass>
    </div>
  );
};
