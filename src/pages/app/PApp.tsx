import { Card } from 'antd';
import React, { FC } from 'react';
import SelfStyle from './PApp.less';
export interface IPAppProps {}
const PApp: FC<IPAppProps> = (props) => {
  return (
    <div>
      <Card title="Card Title">
        <Card.Grid>Content</Card.Grid>
        <Card.Grid hoverable={false}>Content</Card.Grid>
        <Card.Grid>Content</Card.Grid>
        <Card.Grid>Content</Card.Grid>
        <Card.Grid>Content</Card.Grid>
        <Card.Grid>Content</Card.Grid>
        <Card.Grid>Content</Card.Grid>
      </Card>
    </div>
  );
};
export default PApp;
