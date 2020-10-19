import { Card } from 'antd';
import React, from 'react';
import { ConnectRC } from 'umi';
import SelfStyle from './LApp.less';
import NApp from './NApp';
export interface IPAppProps {}
const PApp: ConnectRC<IPAppProps> = (props) => {
  return (
    <div className={SelfStyle.main}>
      <Card>
        {NApp.list.map((item) => (
          <Card.Grid className={SelfStyle.gird} key={item.path}>
            <div
              className={SelfStyle.app}
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
