var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('viewImage', {
  	project:req.query.project, 
  	scene:req.query.scene, 
  	index:req.query.index});
});

module.exports = router;
