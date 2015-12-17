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

// function subsample_image(originalFile, targetFile, factor){
//   var pic = images(originalFile);
//   var width = pic.width()*factor;

//   pic.size(width).save(targetFile);
// }

// app.use('/photos/*.jpg', function(req, res, next){
//   console.log("load image:"+'public'+req.originalUrl);
  

//   if (!fs.existsSync('public'+req.originalUrl))
//   { 
//     console.log("log 0");
//   //File does not exist

//     var regex = new RegExp('__small__.');

//     if (req.originalUrl.search(regex)) { //Find a small pic
//       console.log("log 1");
//       console.log(req.originalUrl.replace(regex, ""));

//       if (fs.existsSync('public'+req.originalUrl.replace(regex, ""))){  //Original copy exist
//         console.log("log 2");
//         subsample_image('public'+req.originalUrl.replace(regex, ""), 'public'+req.originalUrl, 0.125);
//       }
//       next();
//     }
//     console.log("log 3")
    
//     // regex = new RegExp("/__medium__./");
//     // if (regex.test(req.originalUrl)) {
//     //   next();
//     // }
    
//     // regex = (new RegExp("/__large__./"));
//     // if (regex.test(req.originalUrl)) {
//     // }

//   }
//   else {
//     console.log("come here");
//   }
//   // console.log("aaaa");
//   next();
// });

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/photos', photos);
app.use('/meta_data', meta_data);
app.use('/comment', comment);

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
