import NJokes from "./NJokes";

import request from "@/utils/request";
import NRsp from "@/common/namespace/NRsp";
export namespace SJokes {
  export async function getList(): Promise<NRsp<NJokes>> {
    return request({
      url: "/jokes/getJokeList",
    });
  }
  export async function delItem(id: string): Promise<NRsp> {
    return request({
      url: "/jokes/delJoke",
      params: {
        id,
      },
    });
  }
  export async function addItem(
    joke: NJokes,
    index: number = 0
  ): Promise<NRsp<NJokes>> {
    return request({
      url: "/jokes/addJoke",
      method: "post",
      data: {
        joke,
        index,
      },
    });
  }
  export async function editItem(joke: NJokes): Promise<NRsp> {
    return request({
      url: "/jokes/editJoke",
      method: "post",
      data: joke,
    });
  }
}
export default SJokes;
