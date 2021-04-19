import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDBook, NMDGlobal } from "umi";
import { Button, Drawer, Input, Menu } from "antd";
import SelfStyle from "./BookTitleDrawer.less";
import NModel from "@/common/namespace/NModel";
import NBook from "../../NBook";
import SBook from "../../SBook";
import SubMenu from "_antd@4.15.1@antd/lib/menu/SubMenu";
import qs from "qs";
import NRouter from "@/../config/router/NRouter";
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
  return (
    <Drawer
      placement="left"
      className={SelfStyle.main}
      closable={false}
      onClose={onClose}
      visible={props.MDBook.titleDrawer.visible}
    >
      <Menu mode="inline" defaultSelectedKeys={getDefaultSelectedKeys()}>
        <Menu.Item>基本信息</Menu.Item>
        <SubMenu title="序言">
          {renderPieceList(props.MDBook.book.prefaceList, "preface")}
        </SubMenu>
        <SubMenu title="章节">
          {renderPieceList(props.MDBook.book.chapterList, "chapter")}
        </SubMenu>
        <SubMenu title="结语">
          {renderPieceList(props.MDBook.book.epilogList, "epilog")}
        </SubMenu>
      </Menu>
    </Drawer>
  );
  function getDefaultSelectedKeys() {
    return [
      urlQuery.chapterId ||
        urlQuery.epilogId ||
        urlQuery.prefaceId ||
        urlQuery.id,
    ];
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
          {list.map((item) => (
            <Menu.Item
              onClick={() => {
                goEdit(item.id, updateType);
              }}
              key={item.id}
            >
              {item.title || "暂无标题"}
            </Menu.Item>
          ))}
          {renderAddMenuItem(list.length)}
        </>
      );
    } else {
      return renderAddMenuItem(0);
    }
  }
  function goEdit(piececId: string, updateType: NBook.TUpdaeType) {
    window.location.href =
      NRouter.bookEditPath +
      "?" +
      qs.stringify({
        id: urlQuery.id,
        [updateType + "Id"]: piececId,
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
