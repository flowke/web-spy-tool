module.exports = {
  https: true,
  port: 8001,
  chiiMode: 'http',
  USER_HOME: process.env.HOME || process.env.USERPROFILE,
  // https: //developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
  removeCSP: true,
  replaceHost: (url,r)=>{
    // console.log(url, '======================');
    if (url.indexOf('scistatic') !== -1) {
      
      // console.log(r);
      return 'https://www.jianshu.com/'
    }
    
  },
  injectScripts: [
    '//abc.com/cc.js',
    {
      target: 'xueersi.com',
      path: 'c.com'
    }
  ]
}