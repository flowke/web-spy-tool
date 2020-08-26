const Koa = require('koa');
const http = require('http');
const httpsS = require('https');
const sslify = require('koa-sslify').default;
const router = require('./middle/router');
const compress = require('./middle/compress');
const util = require('./lib/util');
const net = require('net');
const WebSocketServer = require('./lib/WebSocketServer');

function start({
  port = 8080,
  host,
  domain,
  server,
  https,
  sslCfg = {}
} = {}) {


  let httpsPort = port+1;
  let httpPort = port+2;

  createServer('http',{
    port: httpPort, domain,
  });

  if (https) createServer('https', {
    port:httpsPort,
    sslCfg,
    domain,
  });

  netServer({
    httpsPort, httpPort,port
  });
  
}


function createServer(type, options){

  let {
    port,
    domain,
    sslCfg = {}
  } = options;

  const app = new Koa();
  const wss = new WebSocketServer();

  domain = (domain || 'localhost') + ':' + port;

  app.use(compress()).use(router(wss.channelManager, domain, type));

  let serverOptions = [app.callback()]

  let serve = http;

  if(type==='https'){
    serverOptions.unshift(sslCfg);
    serve = httpsS
  }


  wss.start(serve.createServer(sslCfg, app.callback()).listen(port))
}

function netServer(op){
  let {httpPort,httpsPort,port} = op;
  net.createServer(socket=>{
    socket.once('data',buf=>{
      let address = buf[0] === 22 ? httpsPort : httpPort;
      let proxy = net.createConnection(address, ()=>{
        proxy.write(buf);
        socket.pipe(proxy).pipe(socket);
      })
      proxy.on('error', function (err) {
        console.log(err);
      });
    })
    socket.on('error', function (err) {
      console.log(err);
    });
  }).listen(port);
}

module.exports = {
  start
}
