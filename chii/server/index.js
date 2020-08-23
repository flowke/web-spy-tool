const Koa = require('koa');
const http = require('http');
const httpsS = require('https');
const sslify = require('koa-sslify').default;
const router = require('./middle/router');
const compress = require('./middle/compress');
const util = require('./lib/util');
const WebSocketServer = require('./lib/WebSocketServer');

function start({
  port = 8080,
  host,
  domain,
  server,
  https,
  sslCfg = {}
} = {}) {
  domain = (domain || 'localhost') + ':'+ port;
  console.log('domain', domain);
  const app = new Koa();
  const wss = new WebSocketServer();

  // if(https){
  //   app.use(sslify())
  // }

  app.use(compress()).use(router(wss.channelManager, domain));

  if (server) {
    server.on('request', app.callback());
    wss.start(server);
  } else {
    util.log(`chii starting server at ${https?'https://':'http://'}${domain}`);
    console.log();
    // const server = host ? app.listen(port, host) : app.listen(port, host);
    if (https){
      server = httpsS.createServer(sslCfg, app.callback()).listen(port);
      // new WebSocketServer().start(httpsS.createServer(sslCfg, app.callback()).listen(port))
    }else{
      server = http.createServer(app.callback()).listen(port);
    }

    // new WebSocketServer().start(http.createServer(app.callback()).listen(port+1))

    wss.start(server);
  }
}

module.exports = {
  start
}
