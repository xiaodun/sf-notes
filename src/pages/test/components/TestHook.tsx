import React, { FC } from 'react';
interface TestHookProps {
  num: number;
}
const TestHook: FC<TestHookProps> = (props) => {
  return <div>{props.num}</div>;
};
export default TestHook;
