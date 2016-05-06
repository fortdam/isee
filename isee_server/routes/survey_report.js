var express = require('express');
var router = express.Router();

var isee_db = require('../database/isee_db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: req.query.project });
  if (req.query.from == 'all'){
  	req.query.from = "";
  }
  console.log('tang zhiming query');
  console.log(req.query.project);
  genReport(req.query.project, req.query.from, res);
});


function genReport(project, user, res){
	//isee_db.open(function(){
		if(project===undefined){
			project = '';
		}

		if(user===null || user===undefined){
			user = '';
		}

		isee_db.getSurvey('', project, function(data){
			if (data && data.length>0){
				var project = data[0];

				isee_db.getSurveyComment(user, project.test, null, null, function(idata){
					var commentInfo = {};

					if(project.select === undefined){
						project.select = [];

						for(var i=1; i<=project.total; i++){
							project.select.push(i);
						}
					}

					commentInfo.project = project.test;
					commentInfo.indice = project.select;
					commentInfo.user = user;
					commentInfo.products = project.products;
					commentInfo.prefix = project.prefix;
					commentInfo.comment = idata;

					res.render('survey_report', {'comments': JSON.stringify(commentInfo)});
				})
			}
			else{
				res.render('survey_report', {'comments':null});//should be an error page	
			}
		})
	//})
}




module.exports = router;
