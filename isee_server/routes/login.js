var express = require('express');
var router = express.Router();

/* GET login page listing. */
router.get('/', function(req, res, next) {
  if (req.originalUrl.indexOf('login') >= 0){
    res.render('login');
  }
  else if(req.originalUrl.indexOf('steptonext')){
  	res.render('steptonext', {'account':req.query.acct, 'mail':req.query.mail});
  }
});


/* Post data. */
router.post('/', function(req, res, next) {
  var account = req.body.acct;
  //var pwd = req.body.password;
  var mail = req.body.mail;
  //add more authorization here
  res.redirect('/steptonext?acct='+account+"&mail="+mail);
});
module.exports = router;