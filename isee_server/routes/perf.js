var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('perf', {
  	project:req.query.project, 
  	version:req.query.version});
});

module.exports = router;
