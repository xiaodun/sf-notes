(function () {
  return function (argData, argParams) {
    argParams = argParams || {};
    const active = (argData || []).filter((item) => !item.deleted);
    const offset = Number(argParams.offset);
    const limit = Number(argParams.limit);
    const paginated =
      argParams.offset != null &&
      argParams.limit != null &&
      Number.isFinite(offset) &&
      Number.isFinite(limit) &&
      limit > 0 &&
      offset >= 0;
    const list = paginated
      ? active.slice(offset, offset + limit)
      : active;
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          list,
          ...(paginated ? { total: active.length } : {}),
        },
      },
    };
  };
})();
