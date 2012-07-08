var sax = require('sax');

// parse "YYYYmmddHHMMss +0900" format
function parseDate(str){
  var year   = str.substr(0, 4);
  var month  = str.substr(4, 2);
  var day    = str.substr(6, 2);
  var hour   = str.substr(8, 2);
  var minute = str.substr(10, 2);
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day),
                  parseInt(hour), parseInt(minute));
}

module.exports = function(xml, callback){
  var parser = sax.parser(false, {trim:true});
  var e1 = null;
  var channels = {};
  var currentChannel = null;
  var currentProgram = null;
  var currentTag = null; // holds tag name for handling 'ontext'
  parser.onopentag = function(node){
    var tagName = node.name;
    switch(tagName){
    case "CHANNEL":
      currentChannel = {
        id: node.attributes.ID,
        name: null,
        programs: []
      };
      channels[currentChannel.id] = currentChannel;
      break;
    case "PROGRAMME":
      currentProgram = {
        id: [currentChannel.id,
             node.attributes.START.split(' ')[0],
             node.attributes.STOP.split(' ')[0]].join('-'),
        start: parseDate(node.attributes.START),
        stop:  parseDate(node.attributes.STOP),
        cid: currentChannel.id
      };
      channels[node.attributes.CHANNEL].programs.push(currentProgram);
      break;
    default:
      // text-node
      if( node.attributes.LANG == "ja_JP" ){
        currentTag = tagName;
      }
    }
  };
  parser.ontext = function(text){
    switch(currentTag){
    case "DISPLAY-NAME":
      currentChannel.name = text;
      break;
    case "CATEGORY":
      currentProgram.category = text;
      break;
    case "TITLE":
      currentProgram.title = text;
      break;
    case "DESC":
      currentProgram.description = text;
      break;

    }
  };
  parser.onerror = function(err){
    e1 = err;
  };
  parser.onend = function(){
    callback(e1, channels);
  };
  parser.write(xml);
  parser.close();
};
