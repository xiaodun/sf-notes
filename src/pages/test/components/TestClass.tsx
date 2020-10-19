import React from 'react';
import { connect } from 'dva';
interface TestClassProps {}
interface TestClassState {}

class TestClass extends React.PureComponent<
  TestClassProps,
  TestClassState
> {
  public render() {
    return <div>1</div>;
  }
}
export default connect(({}) => ({}))(TestClass);
