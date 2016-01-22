var fs = require("fs");
var gm = require("gm");
var process = require("process");
var ExifImage = require('exif').ExifImage;

var isee_db = require('../database/isee_db');


var PHOTO_PATH = "../public/photos/";

var RESIZE_CONFIG = {
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
	prepare_subsample_dir_kernel(originalDir, "small");
	prepare_subsample_dir_kernel(originalDir, "medium");
	prepare_subsample_dir_kernel(originalDir, "large");

	prepare_subsample_dir_kernel(originalDir, "exif");
}

function create_scene_info(originalDir){
	var folder = fs.readdirSync(originalDir);

	for (var i=0; i<folder.length; i++){
		if (fs.lstatSync(originalDir+folder[i]).isDirectory()){
			return; //Not a leaf, return
		}
	}

	var splittedPath = originalDir.match(/\.\.\/(?:\w+)\/(?:\w+)\/(.*)\/(\w+)\/$/);
	var sceneName = splittedPath[2];
	var scenePath = splittedPath[1].split('/');
	var testName = scenePath.shift();

	var folder = fs.readdirSync(originalDir);
	var totalIndex = [];
	var totalDesc = [];

	var sceneDesc = [];
	if (fs.existsSync(originalDir+'/scene.json')){
		sceneDesc = JSON.parse(fs.readFileSync(originalDir+'/scene.json'));
	}

	folder.forEach(function(v,i,a){
		var text = v.match(/_(\d+)\.jpg/i);
		if(text && text.length > 1){
			var num = parseInt(text[1]);
			if (totalIndex.indexOf(num) < 0){
				totalIndex.push(num);
			}
		}
	});
	totalIndex.sort(function(a,b){return a-b});

	totalDesc[totalIndex.length-1] = undefined;

	if (sceneDesc && sceneDesc.length>0){
		sceneDesc.forEach(function(v,i,a){
			var ind = totalIndex.indexOf(v.index);
			totalDesc[ind] = v.desc;
		});


	}


	dbTransaction++;
	isee_db.addScene(testName, sceneName, scenePath, totalIndex, totalDesc, function(){
		dbTransaction--;
	});	
}

function add_project_info_2_db(projectDir, callback){
	isee_db.addPath(projectDir, callback);
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
		subsample_image_kernel(originalFile, "small");
		subsample_image_kernel(originalFile, "medium");
		subsample_image_kernel(originalFile, "large");	
	}
}

function subsample_image_kernel(originalFile, resizeType){
  var pic = gm(originalFile);

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

function project_import(project){
	prepare_mipmap();
	isee_db.open(function(){
		add_project_info_2_db(PHOTO_PATH+project, function(){
			process_all_files(PHOTO_PATH+project+'/', 
				[prepare_subsample_dirs, create_scene_info], //For folders
				[
				name_normalize, 
				subsample_images, 
				extract_exif
				]  //For filez
			);  		
		});
	});
}

// function read_project_info(project){
// 	projectInfo = JSON.parse(fs.readFileSync(PHOTO_PATH+project+'/project.json'));
// 	console.log(projectInfo);
// }

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
	console.log('The command is: node import_project.js <project name>');
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

