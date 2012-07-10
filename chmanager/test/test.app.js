var async = require('async');
var assert = require('chai').assert;
var pkgInfo = require('../package.json');
var helper = require('./helper');
var server = require('../lib/app');
var http = helper.http;
describe('app:', function(){
  before(function(done){
    helper.setup(function(){
      http.startServer(server, done);
    });
  });

  describe('GET /', function(){
    it('should return the server info', function(done){
      http.get('/').end(function(res){
        assert.equal(res.body.name, pkgInfo.name);
        assert.equal(res.body.version, pkgInfo.version);
        done();
      });
    });
  });


  describe('program list', function(){
    before(function(done){
      helper.loadFixture('query.json', done);
    });

    describe('GET /programs/{cid}', function(){
      it('should returns empty list', function(done){
        http.get('/programs/c20').end(function(res){
          assert.equal(res.statusCode, 200);
          assert.typeOf(res.body, 'Array');
          assert.equal(res.body.length, 0);
          done();
        });
      });

      it('should returns 404 when missing cid specified', function(done){
        http.get('/programs/c0').end(function(res){
          assert.equal(res.statusCode, 404);
          done();
        });
      });
    });

    describe('GET /programs/{cid}/{yyyy}/{mm}/{dd}', function(){
      it('should returns the program list', function(done){
        http.get('/programs/c20/2012/01/01').end(function(res){
          assert.typeOf(res.body, 'Array');
          assert.equal(res.body.length, 3);
          done();
        });
      });

      it('should returns 400 for invalid year', function(done){
        http.get('/programs/c20/1000/01/01').end(function(res){
          assert.equal(res.statusCode, 400);
          done();
        });
      });

      it('should returns 400 for invalid month', function(done){
        http.get('/programs/c20/2010/57/01').end(function(res){
          assert.equal(res.statusCode, 400);
          done();
        });
      });

      it('should returns 400 for invalid date', function(done){
        http.get('/programs/c20/2010/57/34').end(function(res){
          assert.equal(res.statusCode, 400);
          done();
        });
      });
    });
  });
});