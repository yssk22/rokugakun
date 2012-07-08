var async = require('async');
var assert = require('chai').assert;
var path = require('path');
var fs   = require('fs');
var helper = require('./helper');
var query = require('../lib/query');
describe('query:', function(){
  var docs = null;
  before(function(done){
    helper.setup(function(){
      helper.loadFixture('query.json', done);
    });
  });

  describe('getProgramListByDate', function(){
    it('should returns the list of programs', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      query.getProgramListByDate('c10', t, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 2);
        done();
      });
    });

    it('should returns the list of programs on options specified', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      query.getProgramListByDate('c10', t, { start: 22, span: 1}, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 1);
        done();
      });
    });

    it('should returns the empty list of programs', function(done){
      var t = new Date(2012, 0, 1); // 2012/01/01
      query.getProgramListByDate('c20', t, function(err, list){
        assert.isNotNull(list);
        assert.equal(list.length, 0);
        done();
      });
    });

  });
});
