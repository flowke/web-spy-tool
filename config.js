module.exports = {
  https: true,
  port: 8001,
  noCache: true,
  USER_HOME: process.env.HOME || process.env.USERPROFILE,
  // https: //developer.mozilla.org/zh-CN/docs/Web/HTTP/CSP
  removeCSP: true,
  // redirect: (url, r) => {

  // },

  anyProxy:{
    silent: true
  }
}