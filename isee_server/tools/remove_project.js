var fs = require("fs");
var gm = require("gm");
var process = require("process");
var cp = require("child_process");
var ExifImage = require('exif').ExifImage;

var isee_db = require('../database/isee_db');


var PHOTO_PATH = "../public/photos/";

var RESIZE_CONFIG = {
	thumb: {
		path: PHOTO_PATH + "cache/__cache__/"
	},
	small: {
		path: PHOTO_PATH + "cache/__small__/"
	},
	medium: {
		path: PHOTO_PATH + "cache/__medium__/"
	},
	large: {
		path: PHOTO_PATH + "cache/__large__/"
	},
	exif: { //A trick to create folder with resize
		path: PHOTO_PATH + "cache/__exif__/"
	}
}

//Main routine starts here
if (process.argv.length < 2) {
	console.log('The command is: node remove_project.js <project name>');
}
else {
	if (fs.existsSync(PHOTO_PATH+process.argv[2])){
		// read_project_info(process.argv[2]);
		cp.exec('rm -rf '+ RESIZE_CONFIG.thumb.path+process.argv[2]);
		cp.exec('rm -rf '+ RESIZE_CONFIG.small.path+process.argv[2]);
		cp.exec('rm -rf '+ RESIZE_CONFIG.medium.path+process.argv[2]);
		cp.exec('rm -rf '+ RESIZE_CONFIG.large.path+process.argv[2]);
		cp.exec('rm -rf '+ RESIZE_CONFIG.exif.path+process.argv[2]);


		isee_db.open(function(){
			isee_db.deleteProject(PHOTO_PATH+process.argv[2], function(){
				//TODO: To leave the comments... maybe we should also delete them?
				cp.exec('rm -rf '+ PHOTO_PATH+process.argv[2]);
				isee_db.close();
				console.log(process.argv[2]+" is removed")
			});
		})



	}
	else{
		console.log("The project doesn't exist, please make sure the project <"+PHOTO_PATH+process.argv[2]+"> exists");
	}
}