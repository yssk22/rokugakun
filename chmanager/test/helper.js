var path     = require('path');
var fs       = require('fs');
var async    = require('async');
var glob     = require('glob');
var assert   = require('chai').assert;
var database = require('../lib/database');
var ObjectID = require('mongodb').ObjectID;

var fixtures = {};
exports.setup = function(done){
  glob(path.join(__dirname, 'fixtures/*.json'), function(err, files){
    var funs = {};
    for(var i in files){
      (function(k){
        var file = files[i];
        funs[path.basename(file)] = function(callback){
          fs.readFile(file, function(err, json){
            var docs = JSON.parse(json);
            for(var i in docs){
              var doc = docs[i];
              // doc._id   = new ObjectID(doc._id);
              doc.start = new Date(doc.start);
              doc.stop  = new Date(doc.stop);
            }
            callback(err, docs);
          });
        };
      })(i);
    }
    console.log(funs);
    async.parallel(funs, function(err, results){
      fixtures = results;
      done();
    });
  });
};

exports.loadFixture = function(name, callback){
  if( !fixtures || !fixtures[name] ){
    throw new Error('Failed to load fixture: Do you use helper.setup before load fixtures?');
  }
  database.connect(function(err, conn){
    if( err ){
      throw err;
    }else{
      conn.collection('programs', function(err, collection){
        if( err ){
          throw err;
        }else{
          collection.drop(function(err){
            var docs = fixtures[name];
            collection.insert(docs, function(err){
              if( err ){
                throw err;
              }else{
                collection.count(function(err, c){
                  assert.equal(c, docs.length);
                  callback();
                });
              }
            });
          });
        }
      });
    }
  });
};
