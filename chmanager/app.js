var app = require('./lib/app');
var logger = require('log4js').getLogger();

app.listen(process.env.VCAP_APP_PORT || 3000, function(){
  var addr = app.address();
  logger.info("rokugakun.chmanager started on %s:%s", addr.address, addr.port);
});
