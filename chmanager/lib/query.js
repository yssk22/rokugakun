var util = require('util');
var chconf = require('./chconf');
var database = require('./database');
var logger = require('log4js').getLogger('query');

function connect(callback){
  database.connect(function(err, conn){
    if( err ){
      callback(err);
    }else{
      conn.collection('programs', function(err, collection){
        if( err ){
          callback(err);
        }else{
          callback(null, collection);
        }
      });
    }
  });
}

var qbLogger = require('log4js').getLogger('queryBench');
function queryWithBenchmark(name, queryObj, callback){
  var s = (new Date()).getTime();
  queryObj.toArray(function(err, result){
    var t = (new Date()).getTime();
    qbLogger.info('[%s] %s sec', name, (t - s) / 1000);
    callback(err, result);
  });
}

exports.getProgramListByDate = function(cid, t, options, callback){
  if( typeof(options) === 'function' ){
    callback = options;
    options = {
      start: 4,
      span:  24
    };
  }
  if( options.start < 0 || options.start > 23 || typeof(options.start) != 'number' ){
    options.start = 4;
  }
  if( options.start < 0 || options.start > 24 || typeof(options.span) != 'number' ){
    options.span = 24;
  }

  var start = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  var stop  = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  start.setHours(options.start);
  stop.setHours(options.start + options.span);
  logger.debug(start);
  logger.debug(stop);
  connect(function(err, collection){
    queryWithBenchmark(
      'getProgramListByDate',
      collection.find({cid: cid,
                       start: {$gte: start},
                       stop:  {$lte: stop}
                      }).sort(), callback);
  });
};

