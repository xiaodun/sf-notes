import React, { useEffect, useState } from "react";
import SelfStyle from "./LActivity.less";
import SActivity from "./SActivity";
import { connect } from "dva";
import { ConnectRC, NMDActivity } from "umi";
import NModel from "@/common/namespace/NModel";
import NActivity from "./NActivity";
import produce from "immer";
import { Space, Select, Button } from "antd";
import { URandom } from "@/common/utils/URandom";

export interface PActivityProps {
  MDActivity: NMDActivity.IState;
}
const PActivity: ConnectRC<PActivityProps> = (props) => {
  const [activityConfigList, setActivityConfigList] = useState<
    [NActivity.ISelectCell]
  >([{ selectValue: "", children: [] }]);
  useEffect(() => {
    reqGetConfig();
  }, []);
  return (
    <div className={SelfStyle.main}>
      <Space direction="vertical">
        {activityConfigList.map((activityConfigs, configIndex) => {
          return (
            <div className={SelfStyle.contentWrap} key={configIndex}>
              <Select
                className={SelfStyle.select}
                value={activityConfigs.selectValue}
                onChange={(value) =>
                  setActivityLine(value, activityConfigs, configIndex)
                }
              >
                {activityConfigs.children.map((item, index) => {
                  return (
                    <Select.Option
                      key={index}
                      disabled={item.isClose}
                      value={item.name}
                    >
                      {item.name}
                    </Select.Option>
                  );
                })}
              </Select>
              {!(
                activityConfigs.selectValue &&
                activityConfigs.children.length < 2
              ) &&
                activityConfigs.children.length !== 0 && (
                  <Button
                    onClick={() =>
                      getActivityLine(activityConfigs, configIndex)
                    }
                    className={SelfStyle.btn}
                  >
                    抽取
                  </Button>
                )}
            </div>
          );
        })}
      </Space>
    </div>
  );
  function setActivityLine(
    name: string,
    activityConfigs: NActivity.ISelectCell,
    configIndex: number
  ) {
    const selectActivity = activityConfigs.children.find(
      (item) => item.name === name
    );
    let nextActivityConfigs: NActivity.ISelectCell = null;
    const newActivityConfigList = produce(activityConfigList, (drafState) => {
      drafState[configIndex].selectValue = name;
      if (selectActivity.children.length > 0) {
        nextActivityConfigs = {
          selectValue: "",
          children: selectActivity.children,
        };
        drafState[configIndex + 1] = nextActivityConfigs;
        // @ts-ignore
        drafState.length = configIndex + 2;
      } else {
        // @ts-ignore

        drafState.length = configIndex + 1;
      }
    });
    //更新UI
    setActivityConfigList(newActivityConfigList);
    if (nextActivityConfigs) {
      getActivityLine(
        nextActivityConfigs,
        configIndex + 1,
        newActivityConfigList
      );
    }
  }
  function getActivityLine(
    activityConfigs: NActivity.ISelectCell,
    configIndex: number,
    argActivityConfigList?: [NActivity.ISelectCell]
  ) {
    if (!argActivityConfigList) {
      argActivityConfigList = activityConfigList;
    }
    let indexList: number[] = [];
    // 处理当前变更的子活动
    if (activityConfigs.children.length) {
      activityConfigs.children.forEach((item, index) => {
        // 不放入和上次相同的活动
        if (activityConfigs.selectValue !== item.name && !item.isClose) {
          //权重越高在数组的相同项越多，这里存储的是索引
          indexList.push(
            ...Array(item.weight)
              .fill(1)
              .map(() => index)
          );
        }
      });
      // 获取一个随机索引
      const selectIndex = URandom.getIntegeValue(0, indexList.length - 1);
      const selectActivity = activityConfigs.children[indexList[selectIndex]];
      let nextActivityConfigs: NActivity.ISelectCell = null;
      if (selectActivity.children.length > 0) {
        nextActivityConfigs = {
          selectValue: "",
          children: selectActivity.children,
        };
      }
      const newActivityConfigList = produce(
        argActivityConfigList,
        (drafState) => {
          drafState[configIndex].selectValue = selectActivity.name;
          if (nextActivityConfigs) {
            //放入下一个活动项
            drafState[configIndex + 1] = nextActivityConfigs;
            // @ts-ignore
            drafState.length = configIndex + 2;
          } else {
            // @ts-ignore
            drafState.length = configIndex + 1;
          }
        }
      );
      //更新UI
      setActivityConfigList(newActivityConfigList);
      if (nextActivityConfigs) {
        //进行下一项抽取
        getActivityLine(
          nextActivityConfigs,
          configIndex + 1,
          newActivityConfigList
        );
      }
    }
  }
  async function reqGetConfig() {
    const rsp = await SActivity.getList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDActivity.ARSetState({
          list: rsp.data,
        })
      );
      setActivityConfigList(
        produce(activityConfigList, (drafState: [NActivity.ISelectCell]) => {
          drafState[0] = {
            selectValue: "",
            children: rsp.data,
          };
        })
      );
    }
  }
};

export default connect(({ MDActivity }: NModel.IState) => ({ MDActivity }))(
  PActivity
);
