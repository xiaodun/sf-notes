import { useEffect } from 'react';
import React from 'react';
import TestHook from './components/TestHook';
import TestClass from './components/TestClass';

export default () => {
  return (
    <div>
      <TestHook num={1}></TestHook>
      <TestClass></TestClass>
    </div>
  );
};
