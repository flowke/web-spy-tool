const AnyProxy = require('anyproxy');
AnyProxy.utils.systemProxyMgr.enableGlobalProxy('192.168.50.104', '8001');
const options = {
  port: 8001,
  rule: require('./proxyRule'),
  webInterface: {
    enable: true,
    webPort: 8002
  },
  throttle: 10000,
  forceProxyHttps: false,
  wsIntercept: false, // 不开启websocket代理
  silent: false,
  dangerouslyIgnoreUnauthorized: true
};

module.exports = ()=>{
  const proxyServer = new AnyProxy.ProxyServer(options);

  proxyServer.on('ready', () => {
    /* */
  });
  proxyServer.on('error', (e) => {
    /* */
  });
  proxyServer.start();

}
