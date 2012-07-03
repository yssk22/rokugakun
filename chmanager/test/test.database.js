var async = require('async');
var assert = require('chai').assert;
var db = require('../lib/database');

describe('database', function(){
  describe('connect', function(){
    it('should support multiple connection', function(done){
      async.parallel([
        function(callback){
          db.connect(function(err, db){
            assert.isNull(err);
            callback();
          });;
        },
        function(callback){
          db.connect(function(err, db){
            assert.isNull(err);
            callback();
          });;
        }
      ], function(err, results){
        done();
      });
    });
  });
});