import React from "react";
import { connect, ConnectRC, NMDBook, NMDGlobal } from "umi";
import { Button, Drawer, Dropdown, Menu } from "antd";
import SelfStyle from "./BookTitleDrawer.less";
import NModel from "@/common/namespace/NModel";
import NBook from "../../NBook";
import SBook from "../../SBook";
import qs from "qs";
import NRouter from "@/../config/router/NRouter";
import { EllipsisOutlined } from "@ant-design/icons";
export interface IBookTitleDrawerProps {
  MDGlobal: NMDGlobal.IState;
  MDBook: NMDBook.IState;
}
export interface IBookTitleDrawerState {
  selectedKeys: string[];
}
const BookTitleDrawer: ConnectRC<IBookTitleDrawerProps> = (props) => {
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as NBook.IUrlQuery;
  const menuDefaults = getMenuDefaults();
  return (
    <Drawer
      placement="left"
      className={SelfStyle.main}
      closable={false}
      onClose={onClose}
      visible={props.MDBook.titleDrawer.visible}
    >
      <Menu
        mode="inline"
        defaultOpenKeys={menuDefaults.openKeys}
        defaultSelectedKeys={menuDefaults.selectedKeys}
      >
        <Menu.Item key={urlQuery.id} onClick={() => goEdit(null, "book")}>
          基本信息
        </Menu.Item>
        <Menu.SubMenu key="preface" title="序言">
          {renderPieceList(props.MDBook.book.prefaceList, "preface")}
        </Menu.SubMenu>
        <Menu.SubMenu key="chapter" title="章节">
          {renderPieceList(props.MDBook.book.chapterList, "chapter")}
        </Menu.SubMenu>
        <Menu.SubMenu key="epilog" title="结语">
          {renderPieceList(props.MDBook.book.epilogList, "epilog")}
        </Menu.SubMenu>
      </Menu>
    </Drawer>
  );
  function getMenuDefaults() {
    if (urlQuery.chapterId) {
      return {
        selectedKeys: [urlQuery.chapterId],
        openKeys: ["chapter"],
      };
    } else if (urlQuery.prefaceId) {
      return {
        selectedKeys: [urlQuery.prefaceId],
        openKeys: ["preface"],
      };
    } else if (urlQuery.epilogId) {
      return {
        selectedKeys: [urlQuery.epilogId],
        openKeys: ["epilog"],
      };
    } else {
      return {
        selectedKeys: [urlQuery.id],
        openKeys: ["book"],
      };
    }
  }
  async function reqCreatBookPiece(updateType: NBook.TUpdaeType, pos: number) {
    const rsp = await SBook.creatBookPiece({
      id: urlQuery.id,
      updateType,
      pos,
    });
    goEdit(rsp.data, updateType);
  }
  function renderPieceList(
    list: NBook.IPieceMenuItem[],
    updateType: NBook.TUpdaeType
  ) {
    const renderAddMenuItem = (pos: number) => (
      <Menu.Item>
        <Button block onClick={() => reqCreatBookPiece(updateType, pos)}>
          添加
        </Button>
      </Menu.Item>
    );
    if (list.length) {
      return (
        <>
          {renderAddMenuItem(0)}
          {list.map((item, index) => {
            const menu = (
              <Menu>
                <Menu.Item
                  onClick={() => reqCreatBookPiece(updateType, index + 1)}
                >
                  向下插入
                </Menu.Item>
              </Menu>
            );
            return (
              <Menu.Item key={item.id}>
                <div className={SelfStyle.menuItem}>
                  <span
                    className={SelfStyle.title}
                    onClick={() => {
                      goEdit(item.id, updateType);
                    }}
                  >
                    {item.title || "暂无标题"}
                  </span>
                  <Dropdown
                    trigger={["click"]}
                    className={SelfStyle.dropdown}
                    overlay={menu}
                  >
                    <Button size="small" className="ant-dropdown-link">
                      <EllipsisOutlined />
                    </Button>
                  </Dropdown>
                </div>
              </Menu.Item>
            );
          })}
          {renderAddMenuItem(list.length)}
        </>
      );
    } else {
      return renderAddMenuItem(0);
    }
  }
  function goEdit(piececId: string, updateType: NBook.TUpdaeType) {
    let params = {
      id: urlQuery.id,
    };
    if (updateType !== "book") {
      params[updateType + "Id"] = piececId;
    }
    window.location.href =
      NRouter.bookEditPath +
      qs.stringify(params, {
        addQueryPrefix: true,
      });
  }
  function onClose() {
    NModel.dispatch(
      new NMDBook.ARSetTitleDrawer({
        visible: false,
      })
    );
  }
};
export default connect(({ MDGlobal, MDBook }: NModel.IState) => ({
  MDGlobal,
  MDBook,
}))(BookTitleDrawer);
