var express = require('express');

var router = express.Router();

var isee_db = require('../database/isee_db');

/* POST a comment */
router.post('/', function(req, res, next) {
  var comment = {
  	user: req.body.user,
    email: req.body.email,
  	project: req.body.project,
  	index: req.body.index,
  	product: req.body.product,
  	score: req.body.score,
  	review: req.body.comment_message
  }
  console.log(comment);
  isee_db.sendSurveyComment(comment);
  res.send("OK");
});

router.get('/', function(req, res, next) {

  isee_db.getSurveyComment(
    req.query.user, 
    req.query.project, 
    req.query.index, 
    req.query.product, 
    function(data){
      console.log('callback comes');
      console.log(data)
      if (data){
        var comment = {};
        if (data && data.length >0){
          comment.state = "yes";
          comment.data = data;
        }
        else{
          comment.state = "no";
        }
        res.send(JSON.stringify(comment));
      }
    });
});

module.exports = router;