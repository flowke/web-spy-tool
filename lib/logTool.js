
require('colors')

let log = (...s)=>{
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