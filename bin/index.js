#!/usr/bin/env node
require('../global');
const serve = require('../index.js');
const certMgr = require('../lib/certManager');
require('colors');


require('yargs')
  .command('ca [action]', '对ca进行操作', (yargs) => {
    yargs
      .positional('action', {
        describe: '可进行的操作项',
        default: 'generate',
        choices: ['generate', 'status', 'trust','clear', 'clear', 'path', 'open', 'init']
      })
  },argv=>{

    certMgr[argv.action]();

  })
  .command('serve [port]', 'start the server', (yargs) => {
    yargs
      .positional('port', {
        describe: 'port to bind on',
        type: 'number'
      })
      .option('https', {
        type: 'boolean'
      })
      .options('config',{
        type: 'string'
      })
  }, (argv) => {
    if (argv.config) {
      _g_options.setConfigPath(argv.config)
    }
    _g_options.merge(argv);

    certMgr.checkStatus()
    .then(r=>{
      
      if(r.exist && r.trusted){
        serve()
      }else{
        _g_log()
          .info('证书不存在或未信任, 当前证书状态: ')


        certMgr.status()
        .then(()=>{
           _g_log
            ()
            .info('如证书不存在, 请运行以下命令生成证书:')
            ('->  spy ca'.green.bold)
            ()
            .info('如证书未信任, 请运行以下命令信任证书, 可能需要输入用户密码:')
            ('->  spy ca trust'.green.bold)
            ()
            .info('初次使用可使用以下命令, 可能需要输入用户密码:')
            ('->  spy ca init'.green.bold)
            ()
            ;

        })

        
      }
    })

    // Serve()
  })

  .option('help', {
    alias: 'h',
    type: 'boolean',
    description: '显示帮助'
  })
  .argv