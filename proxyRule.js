const chii = require('chii');
const internalIp = require('internal-ip');

let localIP = internalIp.v4.sync();



chii.start({
  port: 6759,

})

module.exports = {
  summary: 'a rule to hack response',
  *beforeDealHttpsRequest(){
    return true
  },
  *beforeSendResponse(requestDetail, res) {

    console.log(requestDetail.url);
    console.log(res.response.header);
    console.log(res.response.header['Content-Type']);

    let contentType = res.response.header['Content-Type']

    if (contentType && contentType.indexOf('html') !== -1) {
      console.log(`<script src="http://${localIP}:${6759}/target.js"></script>`);
      let bodyArr = res.response.body.toString().split('</head>');
      // bodyArr[0] += `<script src="http://chii.liriliri.io/target.js"></script>`;
      bodyArr[0] += `<script src="http://${localIP}:${6759}/target.js"></script>`;
      res.response.body = bodyArr.join('</head>');

      // console.log(res.response.body);

    }

    return Promise.resolve({
      response: res.response
    })

  },
};