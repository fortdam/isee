var fs = require("fs");
var process = require("process");
var cp = require('child_process');

var PHOTO_PATH = "../public/photos/";
var BUNDLE_PATH = PHOTO_PATH+"cache/__bundle__/";

var projectInfo = {};

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

function prepare_path(originalDir){
	var targetDir = originalDir.replace(PHOTO_PATH, BUNDLE_PATH);

	var splittedPath = targetDir.split('/');

	var currPath = splittedPath.shift() + "/";

	while(splittedPath.length>0 && splittedPath[0].length>0){
		currPath += splittedPath.shift() + "/";
		//console.log(currPath);
		if (!fs.existsSync(currPath)){
			fs.mkdirSync(currPath);
		}
	}
}

var cache_files = [];

function copy_file(originalFile){
	var targetFile = originalFile.slice(0).replace(PHOTO_PATH, BUNDLE_PATH);

	var splittedPath = targetFile.split('/');

	if (splittedPath[splittedPath.length-1].match(/_(\d+).jpg/i)){
		var index = parseInt((splittedPath[splittedPath.length-1].match(/_(\d+).jpg/i))[1]);

		if(index < 10){
			index = "0"+index;
		}
		else{
			index = index.toString();
		}

		splittedPath[splittedPath.length-1] = "isee"+index+'_'+splittedPath[splittedPath.length-1].replace(/_(\d+).jpg/i,'.jpg');
		targetFile = splittedPath.join('/');

		var entry = {
			'src': originalFile,
			'dest': targetFile
		}

		cache_files.push(entry);
	}
	
}


function copyFile(callback) {
	if (cache_files.length == 0){
		if (callback && typeof(callback) == 'function'){
			callback();
		}
		return;
	}

	var entry = cache_files.shift();
	var source = entry.src;
	var destination = entry.dest;

    if (fs.existsSync(source)) {
        var rOption = {
            flags: 'r',
            encoding: null,
            mode: 0666
        }

        var wOption = {
            flags: 'a',
            encoding: null,
            mode: 0666
        }

        var stream = fs.createReadStream(source, rOption);
        var writable = fs.createWriteStream(destination);

        console.log("Copy: "+source+" to "+destination);
        stream.pipe(writable, wOption);
        writable.on('close', function() {
            copyFile(callback);
        });
    }
}

//Main routine starts here
if (process.argv.length < 2) {
	console.log('The command is: node create_bundle.js <project name>');
}
else {
	if (fs.existsSync(PHOTO_PATH+process.argv[2])){
		// read_project_info(process.argv[2]);

		process_all_files(PHOTO_PATH+process.argv[2]+'/', 
				[prepare_path], //For folders
				[copy_file]  //For filez
			); 

		copyFile(function(){
			cp.exec('tar -czvf '+BUNDLE_PATH+process.argv[2]+'.tar.gz '+BUNDLE_PATH+process.argv[2]).on('exit', function(){
				cp.exec('rm -rf '+BUNDLE_PATH+process.argv[2]);
			})
		});
	}
	else{
		console.log("The project doesn't exist, please make sure the project <"+PHOTO_PATH+process.argv[2]+"> exists");
	}
}