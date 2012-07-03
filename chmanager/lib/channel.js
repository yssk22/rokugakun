var path = require('path');
var fs   = require('fs');
var chconf = require('./chconf');
var exec   = require('child_process').exec;
var TEMPDIR      = process.env['ROKUGAKUN_TMP'] || path.join(__dirname, '../tmp');
var SAMPLING_SEC = parseInt(process.env['SAMPLING_SEC'] || "10");

module.exports = {
  REC_COMMAND: "recpt1",
  DUMP_COMMAND: "epgdump",
  getXml: function(chkey, callback){
    var ch = chconf[chkey];
    if( ch == undefined ){
      return callback(new TypeError('Unknown chkey \'' + chkey + '\''));
    }
    var sampleFile = path.join(TEMPDIR, ch.channel + ".ts");
    
    // recpt1 --b25 channel #{SAMPLING_SEC} #{sampleFile}
    // epgdump chkey #{sampleFile} -
    var command = [module.exports.REC_COMMAND, "--b25", ch.channel, SAMPLING_SEC, sampleFile].join(' ');
    return exec(command, function(err, stdout, stderr){
      if( err ){
        callback(err);
      }else{
        command = [module.exports.DUMP_COMMAND, chkey, sampleFile, '-'].join(' ');
        exec(command, function(err, stdout, stderr){
          if( err ){
            callback(err);
          }else{
            fs.unlink(sampleFile, function(err){
              callback(err, stdout);
            });
          }
        });
      }
    });
  }
}