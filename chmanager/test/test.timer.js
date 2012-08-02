var async = require('async');
var assert = require('chai').assert;
var helper = require('./helper');
var timer = require('../lib/timer');
describe('query:', function(){
  describe('ProgramTimer#save', function(){
    before(function(done){
      helper.setup(function(){
        helper.loadFixture('programs.json', 'programs', function(){
          helper.dropCollection('timers', function(){
            helper.loadFixture('timers.json', 'timers', done);
          });
        });
      });
    });

    it('should fail if invalid pid passed', function(done){
      var t = new (timer.ProgramTimer)();
      t.save(function(err, result){
        assert.isNotNull(err);
        assert.equal(err.error,  "validation_failed");
        assert.equal(err.reason, "番組情報が見つかりません。");
        done();
      });
    });

    it('should fail if another timer has already been stored', function(done){
      var t = new (timer.ProgramTimer)({
        cid: "c27",
        pid: "c27-20380101210000-20380101220000"
      });
      t.save(function(err, result){
        assert.isNotNull(err);
        assert.equal(err.error,  "validation_failed");
        assert.equal(err.reason, "録画予約が重複しています。");
        done();
      });
    });

    it('should fail if the program is past one', function(done){
      var t = new (timer.ProgramTimer)({
        cid: "c20",
        pid: "c20-20120101210000-20120101220000"
      });
      t.save(function(err, result){
        assert.isNotNull(err);
        assert.equal(err.error,  "validation_failed");
        assert.equal(err.reason, "指定した番組はすでに開始されているか終了しています。");
        done();
      });
    });

    it('should save and returns the timer record', function(done){
      var t = new (timer.ProgramTimer)({
        cid: "c27",
        pid: "c27-20380101220000-20380101230000"
      });
      t.save(function(err, result){
        assert.isNull(err);
        assert.isNotNull(result);
        assert.equal(result.cid, "c27");
        assert.equal(result.pid, "c27-20380101220000-20380101230000");
        assert.equal(result.status, "scheduled");
        done();
      });

    });

  });
});