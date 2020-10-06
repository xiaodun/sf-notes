import { Card } from 'antd';
import React, { CSSProperties, FC, StyleHTMLAttributes } from 'react';
import { IRouteComponentProps } from 'umi';
import SelfStyle from './PApp.less';
import TApp from './TApp';
export interface IPAppProps extends IRouteComponentProps {}
const PApp: FC<IPAppProps> = (props) => {
  const gridStyle: CSSProperties = {};
  return (
    <div className={SelfStyle.main}>
      <Card>
        {TApp.list.map((item) => (
          <Card.Grid className={SelfStyle.girdStyle} key={item.path}>
            <div
              className={SelfStyle.appStyle}
              onClick={() => onApp(item.path)}
            >
              <h2>{item.name}</h2>
            </div>
          </Card.Grid>
        ))}
      </Card>
    </div>
  );
  function onApp(path: string) {
    props.history.push(path);
  }
};
export default PApp;
