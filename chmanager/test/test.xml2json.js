var assert = require('chai').assert;
var xml2json = require('../lib/xml2json');
var fs   = require('fs');
var path = require('path');

describe('xml2json', function(){
  describe('Normal channels', function(){
    var ch;
    before(function(done){
      var file = path.join(__dirname, 'fixtures/c27.xml');
      fs.readFile(file, function(err, xml){
        xml2json(xml.toString(), function(err, channels){
          assert.isNull(err);
          ch = channels.c27;
          done();
        });
      });
    });

    it('should have channel id', function(done){
      assert.equal(ch.id, 'c27');
      done();
    });

    it('should have channel name', function(done){
      assert.equal(ch.name, 'ＮＨＫ総合１・東京');
      done();
    });

    it('should have programms', function(done){
      assert.equal(ch.programs.length, 229);
      for(var i in ch.programs){
        var program = ch.programs[i];
        assert.typeOf(program.id,       'string');
        assert.typeOf(program.title,    'string');
        assert.typeOf(program.start,    'Date');
        assert.typeOf(program.stop,     'Date');
        assert.typeOf(program.category, 'string');
      }
      done();
    });
  });
});

