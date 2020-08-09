/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
import serviceJson from '../service/app/config.json';
var IPv4 = 'localhost';
var os = require('os');
let network = os.networkInterfaces();

//动态的获取本机IP地址
for (let key in network) {
  let env = network[key];
  for (var i = 0; i < env.length; i++) {
    if (env[i].family == 'IPv4' && env[i].address != '127.0.0.1') {
      IPv4 = env[i].address;
    }
  }
}
export default {
  dev: {
    '/mock/api/': {
      target: 'localhost',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    [`/${serviceJson.prefix}/`]: {
      target: `http://${IPv4}:${serviceJson.port}/`,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
