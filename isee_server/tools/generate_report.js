var process = require("process");
var fs = require('fs');
var isee_db = require('../database/isee_db');

var project = 'idol4_151207';
var product = '';
var user = '';


if (process.argv[2].match(/help/i)){
	console.log("The usage of the genReport:");
	console.log(" node generate_report.js <project_folder> [product_name [user]]");
}
else{
	genReport(process.argv[2], process.argv[3], process.argv[4]);
}

function genReport(project, product, user){
	isee_db.open(function(){
		if(product===null || product===undefined){
			product = '';
		}

		if(user===null || user===undefined){
			user = '';
		}

		isee_db.getCommentSummary(project, product, user, function(data){
			var currScene = "";
			var currIndex = "";

			var os = fs.createWriteStream('output.txt');
			os.write("The Summary of "+project+ ":\r\n\r\n");

			data.forEach(function(v,i,a){
				if (currScene != v.scene){
					currIndex = '';
					os.write("====="+v.scene+"=====\r\n");
					currScene = v.scene;
				}
				if (currIndex != v.index){
					os.write('  #'+v.index+"\r\n");
					os.write('  Link: http://172.24.197.23:3000/photos?project='+project+"&scene="+v.scene+"&index="+v.index+"\r\n");
					currIndex = v.index;
				}
				var strComment = "    "+v.user;

				while (strComment.length < 20){
					strComment += ' ';
				}
				strComment += ("@"+v.product);
				while (strComment.length < 34){
					strComment += ' ';
				}
				strComment += ("#"+v.grade);
				while (strComment.length < 42){
					strComment += ' ';
				}
				strComment += (':'+v.review+'\r\n');

				os.write(strComment);
			});

			os.end();
			isee_db.close();
		})
	})
}


