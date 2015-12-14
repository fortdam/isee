var express = require('express');
var router = express.Router();

var db = require('../database/db');

/* GET users listing. */
router.get('/project', function(req, res, next) {
  res.send(db.getProjectList());
});

router.get('/scene', function(req, res, next){
	res.send(db.getSceneList(req.query.project));
})

router.get('/scene_num', function(req, res, next){
	res.send(db.getSceneNum(req.query.project, req.query.scene));
})

router.get('/product', function(req, res, next){
	res.send(db.getProduct(req.query.project));
})

module.exports = router;