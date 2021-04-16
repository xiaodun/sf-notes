(function () {
  return function (argData, argParams) {
    const { id, updateType, ...rest } = argParams;
    const book = argData.find((item) => item.id === argParams.id);
    if (updateType === "book") {
      Object.assign(book, rest);
    }
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: {
          success: true,
        },
      },
    };
  };
})();
