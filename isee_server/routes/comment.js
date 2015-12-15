var express = require('express');

var router = express.Router();

var db = require('../database/db');

/* POST a comment */
router.post('/', function(req, res, next) {
  var comment = {
  	user: req.body.user,
  	project: req.body.project,
  	scene: req.body.scene,
  	index: req.body.index,
  	product: req.body.product,
  	grade: req.body.img_grade,
  	review: req.body.comment_message
  }

  db.sendComment(comment);
  res.send("OK");
});

router.get('/', function(req, res, next) {
  console.log("Receive a comment");
  res.send("OK");
});

module.exports = router;