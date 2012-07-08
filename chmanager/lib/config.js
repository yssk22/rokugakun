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

if( !fs.existsSync(configFile ) ){
  configFile = path.join(__dirname, '../conf', 'default.json');
}

module.exports = require(configFile);
