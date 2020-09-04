import React, { StaticLifecycle } from 'react';
interface TestClassProps {}
interface TestClassState {}
export default class TestClass
  implements StaticLifecycle<TestClassProps, TestClassState> {}
