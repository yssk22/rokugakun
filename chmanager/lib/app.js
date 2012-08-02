var express = require('express');
var log4js  = require('log4js');
var chconf  = require('./chconf');
var updater = require('./updater');
var timer   = require('./timer');
var query   = require('./query');
var pkgInfo = require('../package.json');

var app     = express.createServer();
var logger = log4js.getLogger('server');

app.configure(function(){

  app.enable("jsonp callback");
  app.use(express.bodyParser());
  app.use(log4js.connectLogger(log4js.getLogger('access'), { level: log4js.levels.INFO }));
  app.use(app.router);
  app.use(function errorHandler(err, req, res, next){
    // known errors handled
    if( err.stack ){
      logger.fatal(err.stack);
      res.send(500);
    }else{
      switch(err.error){
      case "validation_failed":
        logger.debug('validation_failed: ' + JSON.stringify(req.body));
        res.json(err, 400);
        break;
      default:
        logger.fatal("Reached unknown error handler: " + require('util').inspect(err.toString()));
        res.send(500);
        break;
      }
    }
  });
});

app.get('/', function(req, res, next){
  res.json({
    name: pkgInfo.name,
    version: pkgInfo.version
  });
});

app.get('/jobs/', function(req, res, next){
  updater.getStatsHistory({}, function(err, history){
    res.json(history);
  });
});

app.post('/jobs/', function(req, res, next){
  var queued = updater.updateAll(function(err, tasks){
    // nothing to do;
  });
  if( queued ){
    updater.getCurrentStats(function(err, stats){
      err ? next(err) : res.json(stats);
    });
  }else{
    res.json({
      error: "duplicted"
    }, 400);
  }
});

app.get('/channels/', function(req, res, next){
  for(var cid in chconf){
    chconf[cid].cid = cid;
  }
  res.json(chconf);
});

app.get('/programs/:cid', function(req, res, next){
  var cid     = req.params.cid;
  var t       = new Date();
  var options = {};  // TODO: more detailed filter (such as time)
  query.getProgramListByDate(cid, t, options, function(err, list){
    err ? next(err) : res.json(list);
  });
});

app.get('/programs/:cid/:yyyy/:mm/:dd', function(req, res, next){
  var cid = req.params.cid;
  var t   = new Date(req.params.yyyy, parseInt(req.params.mm) -1, req.params.dd);
  var options = {};  // TODO: more detailed filter (such as time)

  query.getProgramListByDate(cid, t, function(err, list){
    err ? next(err) : res.json(list);
  });
});


app.get('/timers/', function(req, res, next){
  var options = {};
  query.getTimerList(options, function(err, list){
    err ? next(err) : res.json(list);
  });
});

app.post('/timers/', function(req, res, next){
  var t = {
    cid: req.body.cid,
    pid: req.body.pid
  };
  var klass = timer.ProgramTimer;

  (new klass(t)).save(function(err, result){
    err ? next(err) : res.json(result);
  });
});

// parameter validations
app.param('cid', function(req, res, next, cid){
  if( chconf[req.params.cid] ){
    next();
  }else{
    res.json({
      error: "Channel Not Found",
      reason: "The specified channel is not registered in this server. Try GET /channels/ to check registered."
    }, 404);
  }
});

app.param('yyyy', function(req, res, next, yyyy){
  yyyy = parseInt(yyyy);
  if( 2000 <= yyyy && yyyy <= 3000 ){
    next();
  }else{
    res.json({ error: "Invalid Year", reason: "Where are you go?"}, 400);
  }
});

app.param('mm', function(req, res, next, mm){
  mm = parseInt(mm);
  if( 0 <= mm && mm <= 11 ){
    next();
  }else{
    res.json({ error: "Invalid Month", reason: "Where are you go?"}, 400);
  }
});

app.param('dd', function(req, res, next, dd){
  dd = parseInt(dd);
  if( 1 <= dd && dd <= 31 ){
    next();
  }else{
    res.json({ error: "Invalid Day", reason: "Where are you go?"}, 400);
  }
});

module.exports = app;
