#!/usr/bin/env node
const Serve = require('../index.js');
const certMgr = require('../lib/certManager');
const co = require('co');
const path = require('path');
var colors = require('colors');
const exec = require('child_process').exec;
colors.enable();
require('yargs')
  .command('ca [action]', '对ca进行操作', (yargs) => {
    yargs
      .positional('action', {
        describe: '可进行的操作项',
        default: 'generate',
        choices: ['generate', 'status', 'trust','clear', 'clear', 'path', 'open']
      })
  },argv=>{

    certMgr[argv.action]();

  })
  .command('serve [port]', 'start the server', (yargs) => {
    yargs
      .positional('port', {
        describe: 'port to bind on',
        default: 8001
      })
      .option('https', {
        type: 'boolean'
      })
  }, (argv) => {
    certMgr.status()
    .then(r=>{
      if(r.exist){}
    })

    // Serve()
  })

  .option('help', {
    alias: 'h',
    type: 'boolean',
    description: '显示帮助'
  })
  .argv