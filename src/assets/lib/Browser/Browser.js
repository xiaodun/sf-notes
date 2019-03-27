let browserMessage = {};
let userAgent = window.navigator.userAgent;

//判断是否为微信浏览器
if (!!/MicroMessenger/i.test(userAgent)) {
  browserMessage.isWeChat = true;
}

//判断是移动端还是PC端
if (
  userAgent.match(
    /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
  )
) {
  browserMessage.isMobile = true;
} else {
  browserMessage.isPC = true;
}
export default browserMessage;
