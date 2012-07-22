var async = require('async');
var assert = require('chai').assert;
var helper = require('./helper');
var query = require('../lib/query');
describe('query:', function(){
  var docs = null;
  before(function(done){
    helper.setup(function(){
      helper.loadFixture('programs.json', 'programs', function(){
        helper.loadFixture('timers.json', 'timers', done);
      });
    });
  });

  describe('getProgramListByDate', function(){
    it('should returns the list of programs ordered by "start"', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      query.getProgramListByDate('c20', t, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 3);
        for(var i=0; i<list.length-1; i++){
          assert.ok(list[i].start.getTime() < list[i+1].start.getTime());
        }
        done();
      });
    });

    it('should returns the list of programs on options specified', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      // This returns programs that ends after 22 or starts before 23.
      query.getProgramListByDate('c20', t, { start: 22, span: 1}, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 1);
        done();
      });
    });

    it('should returns the empty list of programs', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      query.getProgramListByDate('c10', t, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 0);
        done();
      });
    });
  });

  describe('getTimerListByDate', function(){
    it('should returns the list of timers ordered by "start"', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      query.getTimerListByDate(t, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 1);
        for(var i=0; i<list.length-1; i++){
          assert.ok(list[i].start.getTime() < list[i+1].start.getTime());
        }
        done();
      });
    });
  });
});
