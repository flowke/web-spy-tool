const debug = require('debug');
require('colors')

let log = (...s)=>{

  if(typeof s[0] === 'boolean'){
    let flag = s.shift();

    if(!flag) return log;

  }

  console.log(...s);
  return log
}

let tool = {
  log,
  warn(...r){
    return print('yellow.bold', ...r);

  },
  error(...r){
    return print('red.bold', ...r);
  },

  info(...r){
    return print('bold', ...r);
  },

  debug(title, msg){
    debug(title)(msg)
    return log
  }

}

function print(type, ...args){
  let str = args.join('');

  str = type.split('.').reduce((acc,s)=>{
    return acc[s]
  },str);

  return log(str)
}

Object.entries(tool).forEach((d)=>{

  log[d[0]] = d[1]
})

module.exports = log;