var util = require('util');
var chconf = require('./chconf');
var database = require('./database');
var query    = require('./query');

function validationFailed(reason){
  return {
    error: "validation_failed",
    reason: reason
  };
}

// Base class for timer
function Timer(){};
Timer.prototype.save = function(callback){
  this.generateTimerDoc(function(err, doc){
    if( err ){
      callback(err);
    }else{
      var cid = doc.cid;
      var channel = chconf[cid];
      if( !channel ){
        callback(validationFailed("チャンネル情報が見つかりません。"));
      }else{
        doc.ref_channel = channel;
        database.collection('timers', function(err, collection){
          if( err ){
            callback(err);
          }else{
            // check conflicts.
            collection.find({
              $and  : [
                { stop  : { $gt:  doc.start } },
                { start : { $lt:  doc.stop  } }
              ]
            }).sort({"start": 1}).toArray(function(err, results){
              if( err ){
                callback(err);
              }else{
                if( results.length > 0 ){
                  callback(validationFailed("録画予約が重複しています。"));
                }else{
                  doc.status = 'scheduled';
                  collection.insert(doc, {safe:true}, function(err, doc){
                    callback(err, doc);
                  });
                }
              }
            });
          }
        });
      }
    }
  });
}


function ProgramTimer(options){
  Timer.call(this);
  options = options || {};
  this.cid = options.cid || "unexistent";
  this.pid = options.pid || "unexistent";
}
util.inherits(ProgramTimer, Timer);

ProgramTimer.prototype.generateTimerDoc = function(callback){
  var doc = {
    cid: this.cid,
    pid: this.pid,
    klass: "ProgramTimer"
  };
  database.collection('programs', function(err, collection){
    if( err ){
      callback(err);
    }else{
      collection.findOne({id: doc.pid, cid:doc.cid}, function(err, program){
        if( err ){
          callback(err);
        }else{
          if( !program ){
            callback(validationFailed("番組情報が見つかりません。"));
          }else{
            var now = new Date();
            if( now.getTime() > (program.start.getTime() + 120 * 1000)){
              callback(validationFailed("指定した番組はすでに開始されているか終了しています。"));
            }else{
              doc.start         = program.start;
              doc.stop          = program.stop;
              doc.name          = program.title;
              doc.ref_program   = program;
              callback(null, doc);
            }
          }
        }
      });
    }
  });
}
exports.ProgramTimer = ProgramTimer;

// TODO: implement
function ScheduleTimer(options){
  throw new Error("not implemented yet");
}

// TODO: implement
function AdhocTimer(options){
  throw new Error("not implemented yet");
};