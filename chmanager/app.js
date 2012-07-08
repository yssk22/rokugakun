require('./lib//bootstrap');
var pkgInfo = require('./package.json');
var app     = require('./lib/app');
var log4js  = require('log4js');

app.listen(process.env.VCAP_APP_PORT || 3000, function(){
  var addr = app.address();
  log4js.getLogger().debug("%s started on %s:%s", pkgInfo.name, addr.address, addr.port);
});
