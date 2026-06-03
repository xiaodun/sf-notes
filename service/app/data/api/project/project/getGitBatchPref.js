(function () {
  return function (argData) {
    var pref = argData.gitBatchPref || {
      lastAction: 'pull',
      lastSelectedProjectIds: [],
    };
    return {
      isWrite: false,
      response: {
        code: 200,
        data: {
          success: true,
          pref: pref,
        },
      },
    };
  };
})();
