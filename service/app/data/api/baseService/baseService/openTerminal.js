(function () {
  return function (argData, argParams) {
    const os = require("os");
    const platform = os.platform();

    // Route to platform-specific handler based on SERVER OS,
    // NOT the browser OS. The terminal must open on the server.
    if (platform === "darwin") {
      return require("./openTerminalMac").apply(this, arguments);
    }
    // Default: Windows
    return require("./openTerminalWin").apply(this, arguments);
  };
})();
