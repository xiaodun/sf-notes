;(function () {
  return function (argData, argParams, external) {
    const fs = require('fs');
    let isWrite = false
    const sfNote = argData.projectList.find(
      (item) => item.name === 'sf-notes',
    )
    if (sfNote) {
      let pos = __dirname.indexOf('sf-notes') + 'sf-notes'.length
      const newRootPath = __dirname
        .substring(0, pos)
        .replace(/\\/g, '\\\\')
      // rootPath 为空，或已存储的路径不存在时，自动修正为当前运行目录
      if (!sfNote.rootPath || !fs.existsSync(sfNote.rootPath)) {
        if (sfNote.rootPath !== newRootPath) {
          sfNote.rootPath = newRootPath
          isWrite = true
        }
      }
    }
    return {
      isWrite: isWrite,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
          list: argData.projectList,
        },
      },
    }
  }
})()
