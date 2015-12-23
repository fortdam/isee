var express = require('express');
var router = express.Router();

var db = require('../database/db');
var isee_db = require('../database/isee_db');

isee_db.open();
/* GET users listing. */
router.get('/project', function(req, res, next) {

	isee_db.getProject(function(data){
		res.send(data);
	});

//  res.send(db.getProjectList());
});

router.get('/scene', function(req, res, next){
	res.send(db.getSceneList(req.query.project));
})

router.get('/scene_info', function(req, res, next){
	res.send(db.getSceneInfo(req.query.project, req.query.scene));
})

router.get('/product', function(req, res, next){
	res.send(db.getProduct(req.query.project));
})

module.exports = router;