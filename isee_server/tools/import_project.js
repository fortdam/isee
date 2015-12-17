var fs = require("fs");
var gm = require("gm");
var images = require("images");

var ExifImage = require('exif').ExifImage;



var PHOTO_PATH = "../public/photos/";

var RESIZE_CONFIG = {
	small: {
		path: PHOTO_PATH + "__small__/",
		width: 500,
		quality: 85,
	},
	medium: {
		path: PHOTO_PATH + "__medium__/",
		width: 1000,
		quality: 90,
	},
	large: {
		path: PHOTO_PATH + "__large__/",
		width: 2000,
		quality: 95
	},
	exif: { //A trick to create folder with resize
		path: PHOTO_PATH + "__exif__/",
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

				dirCB(dir+folder[i]+'/');
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
		if (fs.lstatSync(dir+folder[i]).isDirectory()){
			return; //Not a leaf, return
		}
	}
}

function prepare_subsample_dir_kernel(originalDir, resizeType){
	var targetDir = originalDir.replace(PHOTO_PATH, RESIZE_CONFIG[resizeType].path);

	var splittedPath = targetDir.split('/');

	var currPath = splittedPath.shift() + "/";

	while(splittedPath.length>0 && splittedPath[0].length>0){
		currPath += splittedPath.shift() + "/";
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
  console.log(targetFile);

  gm(originalFile)
  	.resize(RESIZE_CONFIG[resizeType].width)
  	.quality(RESIZE_CONFIG[resizeType].quality)
  	.write(targetFile, function(err){});
}

function extract_exif(originalFile){
	var exifFile = originalFile.replace(PHOTO_PATH, RESIZE_CONFIG['exif'].path).replace(/jpg$/i,"exif");

	new ExifImage({ image : originalFile }, function (error, exifData) {
        if (!error){
            fs.writeFileSync(exifFile, JSON.stringify(exifData)); // Do something with your data!
        }            
    });
}

function name_normalize(orignalFile){
	if (orignalFile.match(/JPG$/)) {
		fs.renameSync(orignalFile, orignalFile.replace(/JPG$/, "jpg"));
	}
}

function project_mipmap(project){
	prepare_mipmap();
	process_all_files(PHOTO_PATH+project+'/', 
		[prepare_subsample_dirs, create_scene_info], //For folders
		[name_normalize,subsample_images, extract_exif]  //For filez
		);   
}

function read_project_info(project){
	projectInfo = JSON.parse(fs.readFileSync(PHOTO_PATH+project+'/project.json'));
	console.log(projectInfo);
}

read_project_info('idol3');
project_mipmap('idol3');