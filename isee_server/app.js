var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var photos = require('./routes/photos');
var meta_data = require('./routes/meta_data');
var comment = require('./routes/comment');
var report = require('./routes/report');
var perf = require('./routes/perf');
var login = require('./routes/login');
var survey = require('./routes/survey');
var survey_comment = require('./routes/survey_comment');
var survey_report = require('./routes/survey_report');
var iq_issue = require('./routes/iq_issue');

var fs = require('fs');
var images = require("images");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules/chart.js')));


app.use('/login', login);
app.use('/steptonext', login);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  if (req.cookies.account === undefined){
    var link = new Buffer(req.url).toString('base64');
    res.redirect('/login?url='+link);
  }
  else {
    next();
  }
});


app.use('/', routes);
app.use('/users', users);
app.use('/photos', photos);
app.use('/meta_data', meta_data);
app.use('/comment', comment);
app.use('/report', report);
app.use('/performance', perf);
app.use('/survey', survey);
app.use('/questionair', survey_comment);
app.use('/survey_report', survey_report);
app.use('/issue',iq_issue);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
