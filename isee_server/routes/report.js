var express = require('express');
var router = express.Router();

var isee_db = require('../database/isee_db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: req.query.project });
  genReport(req.query.project, "", "", res);

});


function genReport(project, product, user, res){
	//isee_db.open(function(){
		if(product===null || product===undefined){
			product = '';
		}

		if(user===null || user===undefined){
			user = '';
		}

		console.log('db_is_open');

		var strOut = [];

		isee_db.getCommentSummary(project, product, user, function(data){
			var currScene = "";
			var currIndex = "";

			//var os = fs.createWriteStream('output.txt');
			strOut += ("li The Summary of "+project+ ":\r\n\r\n");
			console.log("The Summary of "+project+ ":\r\n\r\n");
			console.log(data);

			var total_entries= [];

			data.forEach(function(v,i,a){
				var entry = {};
				entry.scene = v.scene + "-" + v.index;
				entry.link = 'http://172.24.197.23:3000/photos?project='+project+'&scene='+v.scene+'&index='+v.index;
				entry.author = v.user;
				entry.product = v.product;
				entry.comment = v.review;
				entry.level = v.grade;

				// if (currScene != v.scene){
				// 	currIndex = '';
				// 	strOut += ("====="+v.scene+"=====\r\n");
				// 	currScene = v.scene;
				// }
				// if (currIndex != v.index){
				// 	strOut += ('li  #'+v.index+"\r\n");
				// 	strOut += ('li  Link: http://172.24.197.23:3000/photos?project='+project+"&scene="+v.scene+"&index="+v.index+"\r\n");
				// 	currIndex = v.index;
				// }
				// var strComment = "    "+v.user;

				// while (strComment.length < 20){
				// 	strComment += ' ';
				// }
				// strComment += ("@"+v.product);
				// while (strComment.length < 34){
				// 	strComment += ' ';
				// }
				// strComment += ("#"+v.grade);
				// while (strComment.length < 42){
				// 	strComment += ' ';
				// }
				// strComment += (':'+v.review+'\r\n');

				// strOut += (strComment);
				total_entries.push(entry);
			});

res.render('report', { comments: JSON.stringify(total_entries)})
			//os.end();
			//isee_db.close();
		})
	//})
}




module.exports = router;
