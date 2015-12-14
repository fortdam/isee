var express = require('express');
var router = express.Router();

/* POST a comment */
router.post('/', function(req, res, next) {
  console.log("Receive a comment");
});

module.exports = router;