// bootstrap

var config = require('./config');
var log4js = require('log4js');
log4js.configure(config.log4js);
log4js.setGlobalLogLevel(config.log4js.globalLogLevel);