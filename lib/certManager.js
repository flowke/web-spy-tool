
const co = require('co');
require('colors');
const certMgr = require('anyproxy/lib/certMgr');

let handle = {
  generate: () => {
    certMgr.generateRootCA((err, keyPath, crtPath) => {
      if (!err) {
        console.log('keyPath: ', keyPath);
        console.log('crtPath: ', crtPath);
      }
    })
  },
  checkStatus(){
    return co(certMgr.getCAStatus)
      .then(result => {
        return result
      })
  },
  status: () => {
    handle.checkStatus()
    .then(result => {
      console.log();
      console.log('trust status:'.bold);
      console.log('  证书是否存在: ', result.exist ? '是' : '否');
      console.log('  证书是否已信任: ', result.trusted ? '是' : '否');
      console.log();
    })

  },
  trust: () => {
    co(certMgr.trustRootCA)

  },
  getCaDir(){
    return certMgr.getRootDirPath()
  },
  path() {
    let s = certMgr.getRootCAFilePath()
    console.log(s);
  },
  open() {
    let s = certMgr.getRootDirPath()
    let file = certMgr.getRootCAFilePath()
    console.log();
    console.log('CA Path:'.bold, file);
    console.log();
    exec('open' + ` ${s}`, )
  },
  clear() {
    certMgr.clearCerts();
    console.log();
    console.log('证书已经清除');
    console.log();
  },
}

module.exports = handle;