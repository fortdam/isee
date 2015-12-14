var express = require('express');
var router = express.Router();

/* POST a comment */
router.post('/', function(req, res, next) {
  console.log("Receive a comment");
  res.send("OK");
});

router.get('/', function(req, res, next) {
  console.log("Receive a comment");
  res.send("OK");
});

module.exports = router;