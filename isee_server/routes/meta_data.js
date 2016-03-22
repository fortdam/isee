var express = require('express');
var router = express.Router();

var db = require('../database/db');
var isee_db = require('../database/isee_db');
var fs= require('fs');

isee_db.open();
/* GET users listing. */
router.get('/project', function(req, res, next) {
	isee_db.getProject(function(data){
		res.send(data);
	});
});

router.get('/scene', function(req, res, next){
	isee_db.getScene(req.query.project, function(data){
		res.send(data);
	})
})

router.get('/product', function(req, res, next){
	isee_db.getProduct(req.query.project, function(data){
		res.send(data);
	})
})

router.get('/performance', function(req, res, next){
	isee_db.findPerfTest(req.query.project, req.query.ver, function(data){
		res.send(data);
	})
})

module.exports = router;