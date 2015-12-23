var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/isee';
var fs = require("fs");

var isee_db = {};

var COL_PROJECT = "project";
var COL_COMMENT = "comment";


isee_db.open = function(callback){
	if (this.db){
		return;
	}

	MongoClient.connect(url,function(err,db){
		assert.equal(null, err);
		isee_db.db = db;
		if(callback){
			callback(db);
		}
	})
}

isee_db.close = function(){
	if(this.db){
		this.db = null;
		this.db.close();
	}
}

isee_db.clear = function(){
	this.db.collection(COL_PROJECT).drop();
	this.db.collection(COL_COMMENT).drop();
}

isee_db.addPath = function(projectPath){

	if(!fs.existsSync(projectPath)){
		console.log("The path doesn't exist: "+projectPath);
		return;
	}
	if(!fs.existsSync(projectPath+"/project.json")){
		console.log("The <<project.json>> doesn't exist in "+projectPath);
		return;
	}

	var project_info = JSON.parse(fs.readFileSync(projectPath+'/project.json'));
	var paths = projectPath.split("/");

	project_info['test'] = paths[paths.length-1];
	project_info['cust_id'] = 1;

	this.addProject(project_info);
}


isee_db.addProject = function(project){
	assert(this.db);
	assert(typeof(project) === 'object');

	this.db.collection(COL_PROJECT).insertOne(project,null);
}

isee_db.getProject = function(callback){
	var db = this.db;

	db.collection(COL_PROJECT).aggregate([
		{$group:{"_id":"$cust_id", "projects":{$push:"$projects"}}}]).toArray(function(err, result){
			var data = {};

			if(result.length>0){
				
				result[0].projects.forEach(function(val, ind, arr){
					val.forEach(function(v, i, a){
						data[v] = [];
					});
				});

				var cursor = db.collection(COL_PROJECT).find({"cust_id":1});
				cursor.each(function(err,doc){
					if (doc){
						console.log(doc);

						for(var i=0;i<Object.keys(data).length; i++){
							var prj = Object.keys(data)[i];

							if(doc.projects.indexOf(prj) > -1){
								data[prj].push({'name':doc.name, 'test':doc.test});
							}
						}
					}
					else{
						console.log("empty doc")
						if (callback){
							callback(data);
						}			
					}
				});				
			}

		});
}


isee_db.addScene = function(){

}

isee_db.updateComment = function(){

}

isee_db.test = function(){
	var cursor = this.db.collection(COL_PROJECT).find();

	cursor.each(function(err, doc) {
      assert.equal(err, null);
      if (doc != null) {
         console.dir(doc);
      } else {
         console.log(doc);
      }
   });
}

module.exports = isee_db;