var path = require('path');
var fs   = require('fs');

var envName = process.env.ROKUGAKUN_ENV || null;

if( envName == null ){
  if( process.env.VCAP_APP_PORT ){
    envName = 'cloud';
  }else{
    envName = 'default';
  }
}

var configFile = path.join(__dirname, '../conf', envName + '.json');

// existsSync compatibility
var existsSync = fs.existsSync || path.existsSync;
if( !existsSync(configFile ) ){
  configFile = path.join(__dirname, '../conf', 'default.json');
}

module.exports = require(configFile);
module.exports.configSrc = path.basename(configFile);
