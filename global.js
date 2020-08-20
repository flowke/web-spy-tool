const logTool = require('./lib/logTool');
const utils = require('./lib/utils');
const options = require('./options');

utils.merge(global.global,{
  _g_log: logTool,
  _g_utils: utils,
  _g_options: options
})