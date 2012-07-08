var mongodb = require('mongodb');
var logger = require('log4js').getLogger('database');
var DB_CONNECTION_POOL_SIZE = parseInt(process.env['DB_CONNECTION_POOL_SIZE'] || 1);

var mongo = null;
if(process.env.VCAP_SERVICES){
  var env = JSON.parse(process.env.VCAP_SERVICES);
  mongo = (env['mongodb-1.8'] || env['mongodb-2.0'])[0].credentials;
}
if( mongo == null ){
  mongo = {
    "hostname":"localhost",
    "port":27017,
    "username":"",
    "password":"",
    "name":"",
    "db":"db"
  };
}
mongo.hostname = (mongo.hostname || 'localhost');
mongo.port     = (mongo.port || 27017);
mongo.db       = (mongo.db   || 'test-rokugakun');

var server = new mongodb.Server(mongo.hostname, mongo.port, {
  autoReconnect: true,
  poolSize: DB_CONNECTION_POOL_SIZE
});
var db = new mongodb.Db(mongo.db, server);
var authRequired = mongo.username && mongo.password;
var openCalled = false;
var waits = [];
function fireCallbacks(err){
  var cb;
  while( cb = waits.pop() ){
    cb(err, db);
  }
}

module.exports = {
  poolSize: server.poolSize,
  connect: function(callback){
    if( server.connected ){
      return callback(null, db);
    }
    waits.push(callback);
    if( openCalled ){
      return;
    }

    openCalled = true;
    return db.open(function(err, success){
      if( err ){
        openCalled = false;
        fireCallbacks(err);
      }else{
        if( authRequired ){
          db.authenticate(mongo.username, mongo.password, function(err, success){
            var cb = null;
            if( success ){
              authRequired = false;
            }else{
              db.close();
              logger.error('Could not authenticate mongodb with ' + mongo.username);
            }
            fireCallbacks(err);
          });
        }else{
          fireCallbacks(err);
        }
      }
    });
  }
};
