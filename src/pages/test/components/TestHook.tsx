import React from 'react';
import NModel from '@/common/namespace/NModel';
import { ConnectRC, NMDTest, connect } from 'umi';
interface TestHookProps {
  num: number;
  name: string;
  MDTest: NMDTest.IState;
}
const TestHook: ConnectRC<TestHookProps> = (props) => {
  return <div onClick={onClick}>点击{props.MDTest.name}</div>;
  function onClick() {
    NModel.dispatch(new NMDTest.AEQuery({ name: 'klo' }));
  }
};
export default connect(({ MDTest }: NModel.IState) => ({
  MDTest,
}))(TestHook);
