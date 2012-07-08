var express = require('express');
var app = express.createServer();
var logger = require('log4js').getLogger();
var chconf = require('./lib/chconf');
var updater = require('./lib/updater');
var query = require('./lib/query');

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

app.get('/programs/:cid', function(req, res){
  var cid     = req.params.cid;
  var t       = new Date();
  var options = {};  // TODO: more detailed filter (such as time)
  query.getProgramListByDate(cid, t, options, function(err, list){
    err ? next(err) : res.json(list);
  });
});

app.get('/programs/:cid/:yyyy/:mm/:dd', function(req, res){
  var cid = req.params.cid;
  var t   = new Date(req.params.yyyy, req.params.mm, req.params.dd);
  var options = {};  // TODO: more detailed filter (such as time)

  query.getProgramListByDate(cid, t, function(err, list){
    err ? next(err) : res.json(list);
  });
});

// parameter validations
app.params('cid', function(req, res, next, cid){
  if( chconf(req.params.cid) ){
    next();
  }else{
    res.json({
      error: "Channel Not Found",
      reason: "The specified channel is not registered in this server. Try GET /channels/ to check registered."
    }, 404);
  }
});

app.params('yyyy', function(req, res, next, yyyy){
  yyyy = parseInt(yyyy);
  if( 2000 <= yyyy && yyyy <= 3000 ){
    next();
  }else{
    res.json({ error: "Invalid Year", reason: "Where are you go?"}, 400);
  }
});

app.params('mm', function(req, res, next, mm){
  mm = parseInt(mm);
  if( 0 <= mm && mm <= 11 ){
    next();
  }else{
    res.json({ error: "Invalid Month", reason: "Where are you go?"}, 400);
  }
});

app.params('dd', function(req, res, next, dd){
  dd = parseInt(dd);
  if( 1 <= dd && dd <= 31 ){
    next();
  }else{
    res.json({ error: "Invalid Day", reason: "Where are you go?"}, 400);
  }
});


if( !module.parent ){
  app.listen(process.env.VCAP_APP_PORT || 3000, function(){
    var addr = app.address();
    console.log("Started on %s:%s", addr.address, addr.port);
  });
}else{
  module.exports = app;
}
