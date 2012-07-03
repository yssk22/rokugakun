var assert = require('chai').assert;
var channel = require('../lib/channel');
var path = require('path');

channel.REC_COMMAND = path.join(__dirname, "mock/recpt1");
channel.DUMP_COMMAND = path.join(__dirname, "mock/epgdump");

describe('channel:', function(){
  describe('getXml', function(){
    it('should return XML string', function(done){
      channel.getXml('c27', function(err, xml){
        assert.equal(err, null);
        assert.typeOf(xml, 'string');
        done();
      });
    });

    it('should raise TypeError on invalid channel key', function(done){
      channel.getXml('invalid', function(err, xml){
        assert.equal(err.constructor.name, "TypeError");
        done();
      });
    });
  });
});
