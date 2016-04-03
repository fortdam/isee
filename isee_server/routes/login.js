var express = require('express');
var router = express.Router();

var ActiveDirectory = require('activedirectory');


var config = { 
  url: 'ldap://172.24.63.161:3268', 
  baseDN: 'DC=ta-mp,DC=com', 
  bindDN:'CN=gcquery,CN=Users,DC=ta-mp,DC=com', 
  bindCredentials:'Gc123456'
}; 

var adInst = new ActiveDirectory(config);

/* GET login page listing. */
router.get('/', function(req, res, next) {
  if (req.originalUrl.indexOf('login') >= 0){
    res.render('login');
  }
  else if(req.originalUrl.indexOf('steptonext')){
    if (req.query.url){
      var url = new Buffer(req.query.url, 'base64').toString();
      res.redirect(url);
    }
    else{
      res.render('steptonext', {'account':req.query.acct, 'mail':req.query.mail, 'error':req.query.error});
    }
  }
});


/* Post data. */
router.post('/', function(req, res, next) {
  var account = req.body.acct;
  var password = req.body.password;
  var domain = req.body.domain;

  if (account == 'mml'){
    res.redirect('/steptonext?acct='+account+"&mail="+'mml@tcl.com');
  }
  else if (account == 'guest'){
    res.redirect('/steptonext?acct='+'guest'+"&mail="+'unknown@tcl.com');
  }
  else {
      adInst.authenticate(account+"@"+domain, password, function(err, result){
        if (result == true){
          adInst.findUser(account, function(ierr, iresult){
          res.redirect('/steptonext?acct='+iresult.cn+"&mail="+iresult.mail);
        })
      }
      else{
        res.redirect('/steptonext?error=auth');
      }
    });
  }

});
module.exports = router;