var util = require('util');
var chconf = require('./chconf');
var database = require('./database');
var query    = require('./query');

function connect(callback){
  database.connect(function(err, conn){
    if( err ){
      callback(err);
    }else{
      conn.collection('timers', function(err, collection){
        if( err ){
          callback(err);
        }else{
          callback(null, collection);
        }
      });
    }
  });
}

// Base class for timer
function Timer(){};
Timer.prototype.save = function(callback){
  var doc = this.generateTimerDoc();
  var cid = doc.cid;
  var channel = chconf[cid];
  if( !channel ){
    callback({
      error: "validation_failed",
      reason: "チャンネル情報が見つかりません。"
    });
  }

  connect(function(err, collection){
    if( err ){
      callback(err);
    }else{
      collection.insert(doc, {safe:true}, function(err, doc){
        callback(err, doc);
      });
    }
  });
}


function ProgramTimer(options){
  this.cid = options.cid;
  this.pid = options.pid;
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