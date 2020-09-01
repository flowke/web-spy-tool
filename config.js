module.exports = {
  https: true,
  port: 8001,
  noCache: true,
  USER_HOME: process.env.HOME || process.env.USERPROFILE,
  // https: //developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
  removeCSP: true,
  redirect: (url, r) => {
    // console.log(url);
    // if (url.indexOf('activity.xueersi.com/lightliveclasstable') !== -1) {

    //   return 'http://192.168.50.104:8080/'
    // }
    
  },
  injectScripts: [
    '//abc.com/cc.js',
    {
      target: 'xueersi.com',
      path: 'c.com'
    }
  ],
  anyProxy:{
    silent: true
  }
}