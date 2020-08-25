module.exports = {
  https: true,
  port: 8001,
  chiiMode: 'https',
  USER_HOME: process.env.HOME || process.env.USERPROFILE,
  // https: //developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
  removeCSP: true,
  replaceHost: (url,r)=>{
   
    if (url.indexOf('activity.xueersi.com/lightliveclasstable') !== -1) {
      console.log('=========================================');
      // console.log(r);
      return 'http://192.168.0.5:8080'
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