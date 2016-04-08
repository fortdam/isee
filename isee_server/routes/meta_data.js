var express = require('express');
var router = express.Router();

var isee_db = require('../database/isee_db');
var fs= require('fs');

isee_db.open();
/* GET users listing. */
router.get('/project', function(req, res, next) {
	isee_db.getProject(req.query.user, function(data){
		res.send(data);
	});
});

router.get('/survey', function(req, res, next) {
	isee_db.getSurvey(req.query.user, req.query.project, function(data){
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