import Vue from "vue";
export const Prefix = "/notepad/upload";
export function download(argItem) {
  //提交下载文件
  return Vue.prototype.$axios.request({
    method: "get",
    url: Prefix + "/download" + `?id=${argItem.id}`,
    responseType: "blob"
  });
}

export function update(argItem) {
  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/update",
    data: {
      id: argItem.id,
      describe: argItem.describe
    }
  });
}
export function del(argId) {
  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/delete",
    data: {
      id: argId
    }
  });
}
export function get() {
  //获取文件
  return Vue.prototype.$axios.request({
    method: "get",
    url: Prefix + "/get"
  });
}
