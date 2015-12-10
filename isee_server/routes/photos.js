var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('viewImage', {pic1:'test1.jpg', pic2:'test2.jpg', pic3:'test3.jpg', pic4:'test1.jpg'});
});

module.exports = router;
