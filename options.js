
const path = require('path');
const local = require('./config');
const log = require('./lib/logTool');


let userConfig = {};
let projectConfigPath = path.resolve('SPYCONFIG.js')


// 设置用户配置
try {
  if (!local.USER_HOME) {
    let err = new Error('没有检测到有效的用户目录, 用户配置将不生效.')
    err.errCode = 0
    throw err
  }

  let cfg = require(path.resolve(local.USER_HOME, '.spyconfig/SPYCONFIG.js'));
  if (({}).toString.call(cfg) === '[object Object]') {
    userConfig = cfg;
  }
} catch (error) {

}


let externalList = []

class Options{
  constructor(){
    this.options = {
      ...local
    }

  }
  get(){
    let projectConfig = this.getProjectConfig()

    return Object.assign({}, this.options, userConfig, projectConfig, ...externalList)
  }

  merge(...obj){
    externalList = externalList.concat(obj);
  }

  set(key, val){
    if(!key) return;
    if(typeof key !== 'string') return;
    this.options[key] = val;
  }
  // 设置默认的本地配置
  getProjectConfig(){
    // console.log(require.resolve.paths(projectConfigPath));
    try {
      let cfg = require(projectConfigPath);

      if(typeof cfg ==='function') cfg = cfg();

      if (({}).toString.call(cfg) === '[object Object]') {
        return cfg;
      }
    } catch (error) {

    }
    return {}
  }
  // 设置用户指定的本地配置
  setConfigPath(configPath){
    configPath = path.resolve(process.cwd(), configPath)
    try {
      let cfg = require(configPath);
      if (({}).toString.call(cfg) === '[object Object]') {
        projectConfigPath = configPath
        projectConfig = cfg;
      }
    } catch (error) {
      log().info(configPath.red + ' 不是一个有效的配置文件.')()
      .info('如果存在, 本地文件配置将使用: ', projectConfigPath.green)()
    }
  }
}

let op = new Options();

module.exports = op