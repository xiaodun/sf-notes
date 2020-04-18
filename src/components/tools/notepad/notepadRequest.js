import Vue from "vue";
const Prefix = "/notepad/notepad";
export function add(argNotepad, argIndex) {
  //提交添加记事

  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/add",
    data: {
      index: argIndex,
      notepad: argNotepad
    }
  });
}
export function update(argNotepad, argIndex) {
  //提交更改记事
  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/update",
    data: argNotepad
  });
}
export function get(argPagination, argFilter = {}) {
  //得到日记信息

  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/get",
    data: {
      page: argPagination.page,
      size: argPagination.size,
      filter: argFilter
    }
  });
}
export function del(argNotepad) {
  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/del",
    data: {
      id: argNotepad.id
    }
  });
}

export function delTag(argId) {
  //同步数据  将记事里面的标签数据删除
  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/removeTag",
    data: {
      id: argId
    }
  });
}
export function top(argItem) {
  return Vue.prototype.$axios.request({
    method: "post",
    url: Prefix + "/top",
    data: {
      id: argItem.id
    }
  });
}
