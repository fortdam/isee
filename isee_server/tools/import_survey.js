var fs = require("fs");
var gm = require("gm");
var process = require("process");
var ExifImage = require('exif').ExifImage;

var isee_db = require('../database/isee_db');


var PHOTO_PATH = "../public/photos/";

var RESIZE_CONFIG = {
	thumb: {
		path: PHOTO_PATH + "cache/__thumb__/",
		width: 200,
		quality: 80
	},	
	small: {
		path: PHOTO_PATH + "cache/__small__/",
		width: 500,
		quality: 85,
	},
	medium: {
		path: PHOTO_PATH + "cache/__medium__/",
		width: 1000,
		quality: 90,
	},
	large: {
		path: PHOTO_PATH + "cache/__large__/",
		width: 2000,
		quality: 95
	},
	exif: { //A trick to create folder with resize
		path: PHOTO_PATH + "cache/__exif__/",
	}
}

var projectInfo = {};

function prepare_mipmap() {
	if (!fs.existsSync(RESIZE_CONFIG.small.path)){
		fs.mkdirSync(RESIZE_CONFIG.small.path);
	}
	if (!fs.existsSync(RESIZE_CONFIG.medium.path)){
		fs.mkdirSync(RESIZE_CONFIG.medium.path);
	}
	if (!fs.existsSync(RESIZE_CONFIG.large.path)){
		fs.mkdirSync(RESIZE_CONFIG.large.path);
	}
}

function process_all_files(dir, dirCB, fileCB){
	var folder = fs.readdirSync(dir);

	for (var i=0; i<folder.length; i++){
		if (fs.lstatSync(dir+folder[i]).isFile()){
			if (fileCB){
				if (Array.isArray(fileCB)){
					for(var ii=0; ii<fileCB.length; ii++){
						fileCB[ii](dir+folder[i]);
					}
				}
				else if (typeof(fileCB) === "function"){
					fileCB(dir+folder[i]);
				}
			}
		}
		else{
			if (dirCB){
				if (Array.isArray(dirCB)){
					for(var ii=0; ii<dirCB.length; ii++){
						dirCB[ii](dir+folder[i]+'/');
					}
				}
				else if (typeof(dirCB) === "function"){
					dirCB(dir+folder[i]+'/');
				}
			}
			process_all_files(dir+folder[i]+'/', dirCB, fileCB);
		}
	}
} 

function prepare_subsample_dirs(originalDir){
	prepare_subsample_dir_kernel(originalDir, "thumb");
	prepare_subsample_dir_kernel(originalDir, "small");
	prepare_subsample_dir_kernel(originalDir, "medium");
	prepare_subsample_dir_kernel(originalDir, "large");

	prepare_subsample_dir_kernel(originalDir, "exif");
}

function add_project_info_2_db(projectDir, callback){
	isee_db.addSurveyPath(projectDir, callback);
}

function prepare_subsample_dir_kernel(originalDir, resizeType){
	var targetDir = originalDir.replace(PHOTO_PATH, RESIZE_CONFIG[resizeType].path);

	var splittedPath = targetDir.split('/');

	var currPath = splittedPath.shift() + "/";

	while(splittedPath.length>0 && splittedPath[0].length>0){
		currPath += splittedPath.shift() + "/";
		console.log(currPath);
		if (!fs.existsSync(currPath)){
			fs.mkdirSync(currPath);
		}
	}
}

function subsample_images(originalFile){	
	if (originalFile.match(/jpg$/i)){
		subsample_image_kernel(originalFile, "thumb");		
		subsample_image_kernel(originalFile, "small");
		subsample_image_kernel(originalFile, "medium");
		subsample_image_kernel(originalFile, "large");	
	}
}

function subsample_image_kernel(originalFile, resizeType){
  // var pic = gm(originalFile);

  var targetFile = originalFile.replace(PHOTO_PATH, RESIZE_CONFIG[resizeType].path);

  if (!fs.existsSync(targetFile)){

	var entry = {};
	entry.originalFile = originalFile;
	entry.width = RESIZE_CONFIG[resizeType].width;
	entry.quality = RESIZE_CONFIG[resizeType].quality;
	entry.targetFile = targetFile;

	cache_files.push(entry);

  	// gm(originalFile)
  	// 	.resize(RESIZE_CONFIG[resizeType].width)
  	// 	.quality(RESIZE_CONFIG[resizeType].quality)
  	// 	.write(targetFile, function(err){});
  }
}

function perform_image_cache(err){
	if (cache_files.length > 0){
		var entry = cache_files.shift();

		console.log("Create:"+entry.targetFile);

		gm(entry.originalFile)
	  		.resize(entry.width)
	  		.quality(entry.quality)
	  		.noProfile()
	  		.write(entry.targetFile, perform_image_cache);
	}
	else
	 {
		close_db_after_pending_works();
	}
}

function extract_exif(originalFile){
	var exifFile = originalFile.replace(PHOTO_PATH, RESIZE_CONFIG['exif'].path).replace(/jpg$/i,"exif");

	if (!fs.existsSync(exifFile)){
		new ExifImage({ image : originalFile }, function (error, exifData) {
	        if (!error){
	        	console.log(exifFile);
	            fs.writeFileSync(exifFile, JSON.stringify(exifData)); // Do something with your data!
	        }            
	    });	
	}
}

function name_normalize(orignalFile){
	if (orignalFile.match(/JPG$/)) {
		fs.renameSync(orignalFile, orignalFile.replace(/JPG$/, "jpg"));
	}
}


function prepare_subsample_dir_kernel(originalDir, resizeType){
	var targetDir = originalDir.replace(PHOTO_PATH, RESIZE_CONFIG[resizeType].path);

	var splittedPath = targetDir.split('/');

	var currPath = splittedPath.shift() + "/";

	while(splittedPath.length>0 && splittedPath[0].length>0){
		currPath += splittedPath.shift() + "/";
		console.log(currPath);
		if (!fs.existsSync(currPath)){
			fs.mkdirSync(currPath);
		}
	}
}

function project_import(project){
	prepare_mipmap();
	isee_db.open(function(){
		add_project_info_2_db(PHOTO_PATH+project, function(){
			prepare_subsample_dirs(PHOTO_PATH+project+'/');
			
			process_all_files(PHOTO_PATH+project+'/', 
				[], //For folders
				[
					name_normalize, 
					subsample_images, 
					extract_exif
				]  //For filez
			);  		
		});
	});
}

var dbTransaction = 0;
var cache_files = [];

function close_db_after_pending_works(){
	if(dbTransaction == 0){
		isee_db.close();
	}
	else {
		setTimeout(close_db_after_pending_works, 5000);
	}
}

//Main routine starts here
if (process.argv.length < 2) {
	console.log('The command is: node import_survey.js <project name>');
}
else {
	if (fs.existsSync(PHOTO_PATH+process.argv[2])){
		// read_project_info(process.argv[2]);
		project_import(process.argv[2]);
		setTimeout(perform_image_cache,5000);
	}
	else{
		console.log("The project doesn't exist, please make sure the project <"+PHOTO_PATH+process.argv[2]+"> exists");
	}
}