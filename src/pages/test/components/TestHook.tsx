import React, { FC } from 'react';
import { connect } from 'dva';
import NModel from '@/common/type/NModel';
import { ConnectRC, MDTest } from 'umi';
interface TestHookProps {
  num: number;
  name: string;
  MDTest: MDTest.IState;
}
const TestHook: ConnectRC<TestHookProps> = (props) => {
  return <div onClick={onClick}>点击{props.MDTest.name}</div>;
  function onClick() {
    NModel.dispatch(new MDTest.AEQuery({ name: 'klo' }));
  }
};
export default connect(({ MDTest }: NModel.IState) => ({
  MDTest,
}))(TestHook);
