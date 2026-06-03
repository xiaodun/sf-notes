(function () {
  return function (argData, argParams) {
    argData.gitBatchPref = {
      lastAction: argParams.lastAction || 'pull',
      lastSelectedProjectIds: argParams.lastSelectedProjectIds || [],
    };
    return {
      isWrite: true,
      data: argData,
      response: {
        code: 200,
        data: { success: true },
      },
    };
  };
})();
