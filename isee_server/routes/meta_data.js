var express = require('express');
var router = express.Router();

var db = require('../database/db');
var isee_db = require('../database/isee_db');

isee_db.open();
/* GET users listing. */
router.get('/project', function(req, res, next) {
	isee_db.getProject(function(data){
		console.log(JSON.stringify(data));
		res.send(data);
	});
});

router.get('/scene', function(req, res, next){
	isee_db.getScene(req.query.project, function(data){
		console.log(JSON.stringify(data))
		res.send(data);
	})
})

router.get('/product', function(req, res, next){
	isee_db.getProduct(req.query.project, function(data){
		console.log(JSON.stringify(data));
		res.send(data);
	})
})

module.exports = router;