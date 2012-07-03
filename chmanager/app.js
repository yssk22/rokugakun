var express = require('express');
var app = express.createServer();
var logger = require('log4js').getLogger();
var chconf = require('./lib/chconf');
var updater = require('./lib/updater');


app.get('/jobs/', function(req, res){
  updater.getStatsHistory({}, function(err, history){
    res.json(history);
  });
});

app.post('/jobs/', function(req, res){
  var queued = updater.updateAll(function(err, tasks){
    // nothing to do;
  });
  if( queued ){
    updater.getCurrentStats(function(err, stats){
      res.json(stats);
    });
  }else{
    res.json({
      error: "duplicted"
    }, 400);
  }
});

app.get('/channels/', function(req, res){
  res.json(chconf);
});

app.get('/channels/:cid', function(req, res){

});

app.get('/channels/:cid/:year/:month/:day', function(req, res){

});



if( !module.parent ){
  app.listen(process.env.VCAP_APP_PORT || 3000, function(){
    var addr = app.address();
    console.log("Started on %s:%s", addr.address, addr.port);
  });
}else{
  module.exports = app;
}
