const chii = require('./chii/server/index');
const internalIp = require('internal-ip');
const fse = require('fs-extra');

let localIP = internalIp.v4.sync();


let targetsString = fse.readFileSync(require.resolve('chii/public/target'), {
  encoding: 'utf8'
})

// console.log(targetsString);


chii.start({
  port: 6759,
  https: true

})

module.exports = {
  summary: 'a rule to hack response',
  *beforeDealHttpsRequest(){
    return true
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
      // console.log(`<script src="http://${localIP}:${6759}/target.js"></script>`);
      let bodyArr = res.response.body.toString().split('</head>');
      // bodyArr[0] += `<script src="http://chii.liriliri.io/target.js"></script>`;
      // bodyArr[0] += `<script>${targetsString}</script>`;
      bodyArr[0] += `<script src="//chii.liriliri.io/target.js"></script>`;
      // bodyArr[0] += `<script src="//${localIP}:${6759}/target.js"></script>`;
      res.response.body = bodyArr.join('</head>');

      // console.log(res.response.body);

    }

    return Promise.resolve({
      response: res.response
    })

  },
};