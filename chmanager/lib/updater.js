var async    = require('async');
var log4js   = require('log4js');
var chconf   = require('./chconf');
var channel  = require('./channel');
var xml2json = require('./xml2json');
var database = require('./database');
var logger = log4js.getLogger('updater');

var stats = null;

module.exports = {
  getCurrentStats: function(callback){
    if( stats ){
      callback(null, stats);
    }else{
      database.connect(function(err, conn){
        if( err ){
          callback(err, null);
        }else{
          conn.collection('jobs', function(err, collection){
            collection.find()
              .sort({start: -1})
              .limit(1)
              .toArray(callback);
          });
        }
      });
    }
    return stats;
  },

  getStatsHistory: function(options, callback){
    database.connect(function(err, conn){
      if( err ){
        callback(err, null);
      }else{
        conn.collection('jobs', function(err, collection){
          var skip = 0;
          var limit = 0;
          collection.find()
            .sort({start: -1})
            .skip(skip)
            .limit(limit)
            .toArray(callback);
        });
      }
    });
  },

  update: function(chkey, callback){
    if( chconf[chkey] === undefined ){
      return callback(new TypeError('Unknown chkey \'' + chkey + '\''));
    }
    logger.info("Updating %s(%s) channel", chkey, chconf[chkey].name);
    var xml, json;
    var task = {
      ch: chkey,
      start: new Date()
    };
    async.parallel({
      collection: function(callback){
        database.connect(function(err, conn){
          if( err ){
            callback(err);
          }else{
            conn.collection('programs', callback);
          }
        });
      },
      docs: function(callback){
        async.series([
          function(callback){
            logger.trace('channel.getXml');
            channel.getXml(chkey, function(err, _xml){
              xml = _xml;
              callback(err);
            });
          },
          function(callback){
            logger.trace('xml2json');
            xml2json(xml, function(err, _json){
              json = _json;
              callback(err);
            });
          }
        ], function(err, results){
          callback(err);
        });
      }
    }, function(err, results){
      var collection = results.collection;
      var docs       = json;
      task.end = new Date();
      var timeToTake = (task.end.getTime() - task.start.getTime()) / 1000;
      if( err ){
        task.error = err;
        task.updates = 0;
        logger.error("Failed to update %s channel: %s (%s sec)",
                     chkey, err.toString(), timeToTake);
        callback(err, task);
      }else{
        task.error   = null;
        task.updates = json[chkey].programs.length;
        var q = async.queue(function(arg, callback){
          var doc = arg.doc;
          collection.update({id: doc.id}, doc, {safe:true, upsert:true}, function(err){
            if( err ){
              logger.error("Failed to update program: %s", doc.id);
            }else{
              logger.debug("Updated program: %s", doc.id);
            }
            callback();
          });
        });
        q.concurrency = database.poolSize;
        q.drain = function(){
          logger.info("Updated %s channel (%s sec)", chkey, timeToTake);
          callback(err, task);
        };
        // register all programm
        for(var i in docs){
          var channel = docs[i];
          for(var j in channel.programs){
            (function(){
              var program = channel.programs[j];
              logger.debug("Update registration: %s", program.id);
              q.push({doc: program});
            })();
          }
        }
      }
    });
  },

  /**
   * Update all channels to the latest.
   */
  updateAll: function(callback){
    if( stats !== null ){
      callback(new Error('Duplicate execution of updating channels.'));
      return false;
    }
    var jobs = []; // result

    stats = {};
    stats.totalChannels = Object.keys(chconf).length;
    stats.start = new Date();
    stats.success = 0;
    stats.fail = 0;

    logger.info("Request to update all %d channels.", stats.totalChannels);
    var q = async.queue(function(task, callback){
      module.exports.update(task.chkey, function(err, job){
        jobs.push(job);
        if( err ){
          stats.fail += 1;
        }else{
          stats.success += 1;
        }
        callback(err, job);
      });
    });
    q.concurrency = 1;
    for(var key in chconf){
      (function(chkey){
        q.push({chkey: chkey});
      })(key);
    }
    q.drain = function(){
      var start = jobs[0].start;
      var end   = jobs[jobs.length - 1].end;
      var timeToTake = (end.getTime() - start.getTime()) / 1000;
      var history = stats;
      stats = null;

      logger.info("All channels has been updated(%s sec)", timeToTake);
      callback(null, jobs);

      // Asynchronously insert the history to jobs collection.
      database.connect(function(err, conn){
        if( err ){
          logger.error("Failed to record update job history", err);
        }else{
          conn.collection('jobs', function(err, collection){
            collection.insert(history);
          });
        }
      });
    };
    return true;
  }
}