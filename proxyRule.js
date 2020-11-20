const chii = require('./chii/server/index');
const internalIp = require('internal-ip');
const fse = require('fs-extra');
const cert = require('./lib/certManager');
const path = require('path');

require('colors');

const URL = require('url').URL;

let localIP = internalIp.v4.sync();
let options = _g_options.get();
let chiiPort = options.port + 2

let isHttps = options.https;

module.exports = class Rule{

  constructor(){
    this.ctx = {
      hittingRedirection: []
    }

    this.startInspector();

    _g_log
      ()
      ('USER_HOME:'.bold, options.USER_HOME)()
      ('localip:'.bold, localIP)()
      ('mode:'.bold, options.https ? 'https' : 'http')()
      ('http proxy serve at: '.bold + `http://${localIP}:${options.port}`)()
      (!!isHttps ,'https proxy serve at: '.bold + `https://${localIP}:${options.port}`)()
      ('web interface serve at: '.bold + `http://${localIP}:${options.port+1}`)()
      (!!isHttps, 'chii https serve at: '.bold + `https://${localIP}:${chiiPort}`)()
      ('chii http serve at: '.bold + `http://${localIP}:${chiiPort}`)()
      
  }

  startInspector(){
    let sslCfg = {}

    if (options.https) {
      sslCfg.key = fse.readFileSync(path.resolve(cert.getCaDir(), 'rootCA.key'))
      sslCfg.cert = fse.readFileSync(path.resolve(cert.getCaDir(), 'rootCA.crt'))
    }

    chii.start({
      port: chiiPort,
      httpsPort: chiiPort,
      httpPort: chiiPort+1,
      https: options.https,
      sslCfg: sslCfg,
      domain: localIP
    });

  }

  getRule(){
    let self = this;
    return {
      // summary: '',
      * beforeDealHttpsRequest() {

        return !!options.https
      },
      * beforeSendRequest(requestDetail) {
        let url = requestDetail.url
        let redirectionURL = peformRedirectHost(url, requestDetail)


        // 是否有要重定向的url
        if (redirectionURL) {
          redirectionURL = redirectionURL.replace(/\/$/,'')+'/'
          // console.log('命中重定向', redirectionURL);
          self.ctx.hittingRedirection.push(redirectionURL)

          _g_log()(url + ' redirect to '.green.bold + redirectionURL)

          return {
            response: {
              statusCode: 302,
              header: {
                'content-type': 'text/html',
                location: redirectionURL
              },
            }
          }
        }

        // 移除缓存
        if (options.noCache) {
          removeCache(requestDetail.requestOptions.headers)
          return {
            requestOptions: requestDetail.requestOptions
          }
        }

      },
      * beforeSendResponse(reqDetail, res) {
        // console.log(reqDetail);
        let contentType = res.response.header['Content-Type'];

        // chii 脚本
        // 验证html
        if (contentType && contentType.indexOf('text/html') !== -1 && Number(res.response.statusCode) < 400) {
          // 移除chii 本身的注入
          if (reqDetail.url.indexOf(':' + chiiPort) !== -1) return;

          // console.log(contentType.bold.cyan, reqDetail.url);
          let content = res.response.body.toString();

          // 验证html
          if (!content || content.indexOf('</head>') === -1) return

          _g_log()('inspector apply to '.bold.cyan, reqDetail.url)

          let bodyArr = content.split('</head>');
          bodyArr[0] += `<script src="//${localIP}:${chiiPort}/target.js"></script>`;
          content = bodyArr.join('</head>');

            // 脚本注入
          if (Array.isArray(options.injectScripts)) {
            let headArr = content.split('<head>');
            options.injectScripts.forEach(d=>{
              if(reqDetail.url.indexOf(d.target)!==-1){
                headArr[0]+=`<script src="${d.path}"></script>`;
              }
            })
            content = headArr.join('<head>');
            // console.log(content.split('/head')[0]);
          }

          res.response.body = content;
        }


        

        // 移除缓存
        if(options.noCache){
          removeCache(res.response.header)
        }

        return Promise.resolve({
          response: res.response
        })

      },
    }
  }
}


function removeCache(headers){
  ;[
    'If-None-Match',
    'If-Modified-Since',
    'Last-Modified',
    'ETag',
    'Cache-Control',
    'Expires'
  ].forEach(d=>{
    headers[d] && (delete headers[d]);
  })

}
// 执行url替换, 返回新字符串
function peformRedirectHost(url, requestDetail) {
  let newURL = ''
  // console.log(options);
  if (Array.isArray(options.redirect)) {
    options.redirect.forEach(d => {

      if (Array.isArray(d) && d[0] && d[1]) {
        if (url.indexOf(d[0]) !== -1) {
          newURL = d[1]
        }
      }

    })
  }

  if (typeof options.redirect === 'function') {
    let d = options.redirect(url, requestDetail)
    if (d && typeof d === 'string') newURL = d;
  }
  return newURL
}