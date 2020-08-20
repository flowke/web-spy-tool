const chii = require('./chii/server/index');
const internalIp = require('internal-ip');
const fse = require('fs-extra');
const cert = require('./lib/certManager');
const path = require('path');
let localIP = internalIp.v4.sync();

let options = _g_options.get()

_g_log()('localip:'.bold, localIP)()
('mode:'.bold, options.https?'https':'http')();



let sslCfg = {}

if (options.https) {
  sslCfg.key = fse.readFileSync(path.resolve(cert.getCaDir(), 'rootCA.key'))
  sslCfg.cert = fse.readFileSync(path.resolve(cert.getCaDir(), 'rootCA.crt'))
}

chii.start({
  port: 6759,
  https: !!options.https,
  sslCfg: sslCfg
})

module.exports = {
  // summary: 'a rule to hack response',
  *beforeDealHttpsRequest(){
    console.log(!!options.https);
    return !!options.https
  },
  // * beforeSendRequest(requestDetail) {
  //   console.log('heeee', requestDetail.url);
  //   if (requestDetail.url.indexOf('target.js') !== -1) {
  //     console.log('hiisre');
  //     const newOption = requestDetail.requestOptions;
  //     newOption.port = 80;
  //     return {
  //       protocol: 'http',
  //       requestOptions: newOption
  //     };
  //   }
  // },
  *beforeSendResponse(requestDetail, res) {

    // console.log(requestDetail.url);
    console.log(res.response.header);
    console.log(res.response.header['Content-Type']);

    let contentType = res.response.header['Content-Type']

    if (contentType && contentType.indexOf('html') !== -1) {

      let bodyArr = res.response.body.toString().split('</head>');

      bodyArr[0] += `<script src="https://${localIP}:${6759}/target.js"></script>`;
      res.response.body = bodyArr.join('</head>');

    }

    return Promise.resolve({
      response: res.response
    })

  },
};