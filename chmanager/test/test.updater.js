var async = require('async');
var assert = require('chai').assert;
var channel = require('../lib/channel');
var updater = require('../lib/updater');
var path = require('path');

channel.REC_COMMAND = path.join(__dirname, "mock/recpt1");
channel.DUMP_COMMAND = path.join(__dirname, "mock/epgdump");

describe('updater:', function(){
  describe('update', function(){
    it('should return the job result', function(done){
      updater.update('c27', function(err, job){
        assert.equal(err, null);
        assert.equal(job.ch, 'c27');
        assert.equal(job.error, null);
        assert.equal(job.updates, 1);
        assert.typeOf(job.start, 'Date');
        assert.typeOf(job.end, 'Date');
        done();
      });
    });
  });

  describe('updateAll', function(){
    it('should return task list including errors', function(done){
      updater.updateAll(function(err, tasks){
        for(var i in tasks){
          var task = tasks[i];
          if( task.ch == 'c27' ){
            assert.equal(task.error, null);
            assert.equal(task.updates, 1);
          }else{
            assert.equal(task.error.code, 1);
          }
        }
        done();
      });
    });

    it('should return an error on duplicate execution', function(done){
      var errorCount = 0;
      async.parallel([
        function(callback){
          updater.updateAll(function(err, tasks){
            if( err ){
              errorCount += 1;
            }
            callback();
          });
        },
        function(callback){
          updater.updateAll(function(err, tasks){
            if( err ){
              errorCount += 1;
            }
            callback();
          });
        }
      ], function(err, results){
        assert.equal(errorCount, 1);
        done();
      });
    });
  });
});
