import React from 'react';
interface TestClassProps {}
interface TestClassState {}
export default class TestClass extends React.PureComponent<
  TestClassProps,
  TestClassState
> {
  public render() {
    return <div>1</div>;
  }
}
