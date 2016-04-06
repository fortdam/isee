var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('survey', {
  	project:req.query.project, 
  	index:req.query.index});
});

module.exports = router;