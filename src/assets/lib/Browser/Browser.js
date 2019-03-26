let browserMessage = {};
let userAgent = window.navigator.userAgent;

if (!!/MicroMessenger/i.test(userAgent)) {
  browserMessage.isWeChat = true;
}
export default browserMessage;
