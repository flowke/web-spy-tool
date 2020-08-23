const chii = require('./chii/server/index');
const internalIp = require('internal-ip');
const fse = require('fs-extra');
const cert = require('./lib/certManager');
const path = require('path');
const URL = require('url').URL;
let localIP = internalIp.v4.sync();

let options = _g_options.get();

let chiiPort = options.port + 2

_g_log
()
('USER_HOME:'.bold, options.USER_HOME)()
('localip:'.bold, localIP)()
('mode:'.bold, options.https?'https':'http')()
('http proxy serve at: '.bold+`http://${localIP}:${options.port}`)()
('https proxy serve at: '.bold + `https://${localIP}:${options.port}`)()
('web interface serve at: '.bold + `http://${localIP}:${options.port+1}`)()
('chii serve at: '.bold + `https://${localIP}:${chiiPort}`)()
;



let sslCfg = {}

if (options.https) {
  sslCfg.key = fse.readFileSync(path.resolve(cert.getCaDir(), 'rootCA.key'))
  sslCfg.cert = fse.readFileSync(path.resolve(cert.getCaDir(), 'rootCA.crt'))
}

chii.start({
  port: chiiPort,
  https: options.chiiMode==='https',
  sslCfg: sslCfg,
  domain: localIP
})

module.exports = {
  // summary: 'a rule to hack response',
  *beforeDealHttpsRequest(){

    return !!options.https
  },
  *beforeSendRequest(requestDetail) {
    let url = requestDetail.url
    let newURL = ''

    if (Array.isArray(options.replaceHost)) {
      options.replaceHost.forEach(d => {

        if (Array.isArray(d) && d[0] && d[1]) {
          if (url.indexOf(d[0])!==-1){
            newURL = d[1]
          }
        }

      })
    }

    if (typeof options.replaceHost === 'function') {
      let d = options.replaceHost(url, requestDetail)
      if(d && typeof d==='string') newURL = d;
    }

    // console.log('袅袅娜娜那你呢年女', newURL);

    if (newURL) {

      return {
        response: {
          statusCode: 302,
          header: {
            'content-type': 'text/html',
            location: 'http://192.168.0.5:8080'
          },
        }
      }
    }

    // if(newURL && newURL.indexOf('http')===0){

    //   let urlObj = new URL(newURL);
    //   const newRequestOptions = requestDetail.requestOptions;

    //   let {
    //     hostname, port
    //   } = urlObj

    //   Object.assign(newRequestOptions, {
    //     hostname
    //   });
    //   // requestDetail.protocol = urlObj.protocol;
    //   console.log('------------------------------------', newURL);
    //   return {
    //     response: {
    //       statusCode: 301,
    //       header: {
    //         'content-type': 'text/html',
    //         location: newURL
    //       },
    //     }
    //   }
    // }
    // return requestDetail
  },
  *beforeSendResponse(requestDetail, res) {

    

    // console.log('url',requestDetail.url);
    // console.log(res.response.header);
    // console.log(res.response.header['Content-Type']);

    let contentType = res.response.header['Content-Type']

    // chii 脚本
    if (contentType && contentType.indexOf('html') !== -1 ) {
      let bodyArr = res.response.body.toString().split('</head>');

      bodyArr[0] += `<script src="//${localIP}:${chiiPort}/target.js"></script>`;
      res.response.body = bodyArr.join('</head>');
    }


    // 脚本注入
    if (Array.isArray(options.injectScripts)) {
      
    }

    return Promise.resolve({
      response: res.response
    })

  },
};
