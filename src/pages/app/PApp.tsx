import { Card } from "antd";
import React from "react";
import { ConnectRC, Link } from "umi";
import SelfStyle from "./LApp.less";
import NApp from "./NApp";
export interface IPAppProps {}
const PApp: ConnectRC<IPAppProps> = () => {
  return (
    <div className={SelfStyle.main}>
      <Card>
        {NApp.list.map((item) => (
          <Card.Grid className={SelfStyle.gird} key={item.path}>
            <div className={SelfStyle.app}>
              {item.linkType === "external" ? (
                <a href={item.path} target="_blank" rel="noopener noreferrer">
                  <h2>{item.name}</h2>
                </a>
              ) : (
                <Link to={item.path}>
                  <h2>{item.name}</h2>
                </Link>
              )}
            </div>
          </Card.Grid>
        ))}
      </Card>
    </div>
  );
};
export default PApp;
