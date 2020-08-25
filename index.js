const AnyProxy = require('anyproxy');
// AnyProxy.utils.systemProxyMgr.enableGlobalProxy('127.0.0.1', '8001');
let option = _g_options.get();

module.exports = ()=>{
  const options = {
    port: option.port,
    rule: new (require('./proxyRule'))().getRule(),
    webInterface: {
      enable: true,
      webPort: option.port+1
    },
    throttle: 10000,
    forceProxyHttps: false,
    wsIntercept: false, // 不开启websocket代理
    silent: false,
    dangerouslyIgnoreUnauthorized: true,
    ...(option.anyProxy||{})
  };

  const proxyServer = new AnyProxy.ProxyServer(options);

  proxyServer.on('ready', () => {
    /* */
  });
  proxyServer.on('error', (e) => {
    /* */
  });
  proxyServer.start();

}
