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
		this.db.close();
		this.db = null;
	}
}

isee_db.clear = function(callback){
	var db = this.db;

	db.collection(COL_PROJECT).drop(function(err, resp){
		db.collection(COL_COMMENT).drop(function(err, resp){
			if(callback){
				callback();
			}
		});
	});
}

isee_db.addPath = function(projectPath, callback){

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

	var inst = this;
	this.db.collection(COL_PROJECT).deleteMany({"test":project_info['test']},
		function(){
			inst.addProject(project_info, callback);
		});
}


isee_db.addProject = function(project, callback){
	assert(this.db);
	assert(typeof(project) === 'object');

	this.db.collection(COL_PROJECT).insertOne(project,callback);
}


isee_db.addScene = function(project, name, path, indice, callback){
	assert(this.db);
	var scene_info = {
		'test': project,
		'name': name,
		'path': path,
		'number': indice,
		'cust_id': 2
	};
	console.log('haha scene_info');
	this.db.collection(COL_PROJECT).insertOne(scene_info, callback);
}


isee_db.getProject = function(callback){
	var db = this.db;

	db.collection(COL_PROJECT).aggregate([
		{$match:{"cust_id":1}},
		{$group:{"_id":"$cust_id", "projects":{$push:"$projects"}}}
		]).toArray(function(err, result){
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
						//console.log(doc);

						for(var i=0;i<Object.keys(data).length; i++){
							var prj = Object.keys(data)[i];

							if(doc.projects.indexOf(prj) > -1){
								data[prj].push({'name':doc.name, 'test':doc.test});
							}
						}
					}
					else{
						console.log(data);
						if (callback){
							callback(data);
						}			
					}
				});				
			}
		}
	);
}

isee_db.getScene = function(test, callback){
	var db = this.db;

	this.db.collection(COL_PROJECT).aggregate([
		{$match:{"cust_id":2, "test":test}},
		{$project:{"_id":0, "name":1, "path":1, "number":1}}
		]).toArray(function(err, result){
			callback(result);
		}
	);
}

isee_db.getProduct = function(test, callback){
	assert(this.db);

	this.db.collection(COL_PROJECT).aggregate([
		{$match:{"cust_id":1, "test":test}},
		{$project:{"_id":0, "products":1, "prefix":1}}
		]).toArray(function(err, result){
			callback(result[0]);
		}
	);
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