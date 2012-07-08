var pkgInfo = require('./package.json');
var app     = require('./lib/app');
var logger  = require('log4js').getLogger();

app.listen(process.env.VCAP_APP_PORT || 3000, function(){
  var addr = app.address();
  logger.info("%s started on %s:%s", pkgInfo.name, addr.address, addr.port);
});
