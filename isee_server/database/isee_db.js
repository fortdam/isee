var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/isee';
var fs = require("fs");

var isee_db = {};

var COL_PROJECT = "project";
var COL_COMMENT = "comment";
var COL_PERF = "performance";
var COL_GROUP = "group";

var COL_SURVEY = "survey";
var COL_SURVEY_COMMENT = "surveycomment";


isee_db.open = function(callback){
	if (this.db){
		return;
	}

	MongoClient.connect(url,function(err,db){
		assert.equal(null, err);
		isee_db.db = db;
		db.collection(COL_GROUP).find({'cust_id':1}).toArray(function(err, docs){
			//Pre-populate the group information
			isee_db.groups = docs;
			if(callback){
				callback(db);
			}
		});

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


isee_db.addTest = function(test, callback, col){
	assert(this.db);
	assert(typeof(test) === 'object');

	this.db.collection(col).insertOne(test,callback);
}


isee_db.addPath = function(path, callback, col){

	if(!fs.existsSync(path)){
		// console.log("The path doesn't exist: "+path);
		return;
	}
	if(!fs.existsSync(path+"/project.json")){
		// console.log("The <<project.json>> doesn't exist in "+path);
		return;
	}

	var project_info;

	try{
		project_info = JSON.parse(fs.readFileSync(path+'/project.json'));
	}
	catch(e){
		console.log('Wrong JSON File:'+path+'/project.json');
		throw(e);
	}

	var paths = path.split("/");

	project_info['test'] = paths[paths.length-1];
	project_info['cust_id'] = 1;

	var inst = this;
	this.db.collection(col).deleteMany({"test":project_info['test']},
		function(){
			inst.addTest(project_info, callback, col);
		});
}

isee_db.addProjectPath = function(projectPath, callback){
	this.addPath(projectPath, callback, COL_PROJECT);
}


isee_db.addSurveyPath = function(surveytPath, callback){
	this.addPath(surveytPath, callback, COL_SURVEY);
}

isee_db.deletePath = function(path, callback, col){
	if(!fs.existsSync(path)){
		// console.log("The path doesn't exist: "+path);
		return;
	}
	if(!fs.existsSync(path+"/project.json")){
		// console.log("The <<project.json>> doesn't exist in "+path);
		return;
	}

	var project_info = {};


	var paths = path.split("/");

	project_info['test'] = paths[paths.length-1];
	project_info['cust_id'] = 1;

	var inst = this;
	this.db.collection(col).deleteMany({"test":project_info['test']},
		function(){
			if(callback && typeof(callback) == 'function'){
				callback();
			}
		});	
}

isee_db.deleteProject = function(projectPath, callback){
	this.deletePath(projectPath, callback, COL_PROJECT);
}

isee_db.deleteSurvey = function(surveyPath, callback){
	this.deletePath(surveyPath, callback, COL_SURVEY);
}




isee_db.addScene = function(project, name, path, indice, descs, callback){
	assert(this.db);
	var scene_info = {
		'test': project,
		'name': name,
		'path': path,
		'number': indice,
		'desc': descs,
		'cust_id': 2
	};
	this.db.collection(COL_PROJECT).insertOne(scene_info, callback);
}


isee_db.getOneProject = function(test, callback){
	var db = this.db;

	db.collection(COL_PROJECT).find({'cust_id':1, "test":test}).toArray(function(err, docs){
		callback(docs[0]);
	});
}

isee_db._VerifyUserInGroupList = function(user, group){
	var inGroup = [];
	var result = false;


	isee_db.groups.forEach(function(v,i,a){
		if (v.member.indexOf(user)>=0 && inGroup.indexOf(v)<0){
			inGroup.push(v.name);
		}
	});


	if(group instanceof Array){
		group.forEach(function(v,i,a){
			if(inGroup.indexOf(v)>=0){
				result = true;
			}
		})
	}
	else if (typeof(group) == 'string'){
		return (inGroup.indexOf(group)>=0);
	}
	else {
		return true;
	}

	return result;
}

isee_db.getProject = function(user, callback){
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
						for(var i=0;i<Object.keys(data).length; i++){
							var prj = Object.keys(data)[i];

							if(doc.projects.indexOf(prj) > -1 && isee_db._VerifyUserInGroupList(user, doc.group)){
								data[prj].push({'name':doc.name, 'test':doc.test, 'time':doc.time, 'desc':doc.desc});
							}
						}
					}
					else{
						if (callback){
							callback(data);
						}			
					}
				});				
			}
		}
	);
}

isee_db.getSurvey = function(user, callback){
	var db = this.db;

	db.collection(COL_SURVEY).find({"cust_id":1}).toArray(function(err, docs){
		if(callback && typeof(callback)=='function'){
			callback(docs);
		}
	})
}

isee_db.getScene = function(test, callback){
	var db = this.db;

	this.db.collection(COL_PROJECT).aggregate([
		{$match:{"cust_id":2, "test":test}},
		{$project:{"_id":0, "name":1, "path":1, "number":1, "desc":1}}
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


isee_db.sendComment = function(comment){
	assert(this.db);

	var db = this.db;
	var sent = false;

	comment.user = comment.user.toLowerCase();

	this.db.collection(COL_COMMENT).deleteMany({
		"user":comment.user, 
		"project": comment.project, 
		"scene":comment.scene, 
		"index":comment.index, 
		"product":comment.product}, function(){
			// console.log("check double insert!")
			if (comment.review.length>0 && sent==false){ //elsewhere we consider user want to delete a comment
				sent = true;
				db.collection(COL_COMMENT).insertOne(comment);
			}
		});
}

isee_db.sendSurveyComment = function(comment){
	assert(this.db);

	var db = this.db;
	var sent = false;

	comment.user = comment.user.toLowerCase();

	console.log('hahahaha            '+comment)

	this.db.collection(COL_SURVEY_COMMENT).deleteMany({
		"user":comment.user, 
		"project": comment.project, 
		"index":comment.index, 
		"product":comment.product}, function(){
			if (sent==false){ //elsewhere we consider user want to delete a comment
				sent = true;
				console.log('delete many successful');
				console.log(comment);
				db.collection(COL_SURVEY_COMMENT).insertOne(comment);
			}
		});
}

isee_db.getComment = function(user, project, scene, index, product, callback){
	assert(this.db);

	var cursor = this.db.collection(COL_COMMENT).find({
		"user":user.toLowerCase(), 
		"project":project, 
		"scene": scene, 
		"index": index, 
		"product": product});

	cursor.toArray(function(err, data){
		callback(data)
	});
}

isee_db.getSurveyComment = function(user, project, index, product, callback){
	assert(this.db);


	var criteria = {};

	if(user && user.length>0){
		criteria.user = user.toLowerCase();
	}

	if(project && project.length>0) {
		criteria.project = project;
	}

	if (index && index>=0){
		criteria.index = index;
	}

	if (product && product.length>0){
		criteria.product = product;
	}

	var cursor = this.db.collection(COL_SURVEY_COMMENT).find(criteria);

	cursor.toArray(function(err, data){
		callback(data)
	});
}

isee_db.getCommentSummary = function(project, product, user, callback){
	assert(this.db);

	var findCriteria = {};
	var sortCriteria = {};

	if (project.length > 0){
		findCriteria.project = project;
	}
	else {
		sortCriteria.project = 1;
	}

	if (product.length > 0){
		findCriteria.product = product;
	}

	if (user.length > 0){
		findCriteria.user = user;
	}

	sortCriteria.scene = 1;
	sortCriteria.index = 1;

	if (product.length == 0){
		sortCriteria.product = 1;
	}

	// console.log(sortCriteria);

	this.db.collection(COL_COMMENT).find(findCriteria).sort(sortCriteria).toArray(function(err, docs){
		callback(docs);
	})
}


isee_db.addPerfTest = function(data, callback){
	assert(this.db);

	var inst_db = this.db;

	this.db.collection(COL_PERF).deleteMany({
		'product': data.product,
		'baseline': data.baseline,
		'hardware': data.hardware,
		'software': data.software,
		'app': data.app,
		'cust_id': 1
	}, function(){
		inst_db.collection(COL_PERF).insertOne(data, callback);
	})
}

isee_db.addPerfRef = function(data, callback){
	assert(this.db);

	var inst_db = this.db;

	this.db.collection(COL_PERF).deleteMany({
		'product': data.product,
		'cust_id': 2,
	}, function(){
		inst_db.collection(COL_PERF).insertOne(data, callback);
	})
}

isee_db.findPerfTest = function(project, version, callback){

	var name_pattern;
	var sw_pattern;

	if (project.match(/idol4s/i)){
		name_pattern = /Idol 4S/i;
	}
	else if (project.match(/gandalf/i) || project.match(/vodafone/i) ||  project.match(/vdf/i)){
		name_pattern = /VDF/i;
	}
	else {
		name_pattern = /idol 4$/i;
	}

	if (version){
		if (version.match(/sw/i)){
			version = version.slice(2,5);
		}

		sw_pattern = new RegExp(version.slice(0,2)+"\\w{2}"+version.slice(2,3),'i');

		var inst_db = this.db;

		this.db.collection(COL_PERF).find({software:{$regex:sw_pattern}, product:{$regex:name_pattern}, cust_id:1}).toArray(function(err, docs){
			inst_db.collection(COL_PERF).find({product:{$regex:name_pattern}, cust_id:2}).toArray(function(ierr, idocs){
				if (docs.length > 0) {
					docs[0].reference = idocs[0]; //We assume there's only one record in doc & idoc
				}
				callback(docs);
			})
		})
	}
	else {
		var inst_db = this.db;

		this.db.collection(COL_PERF).find({product:{$regex:name_pattern}, cust_id:1}).toArray(function(err, docs){
			inst_db.collection(COL_PERF).find({product:{$regex:name_pattern}, cust_id:2}).toArray(function(ierr, idocs){
				if (docs.length > 0){
					docs[0].reference = idocs[0]; //We assume there's only one record in doc & idoc
				}
				callback(docs);
			})
		})
	}
}

isee_db.addMember = function(group, user, callback){
	var inst_db = this.db;

	group = group.toLowerCase();

	this.db.collection(COL_GROUP).find({'name': group, 'cust_id':1}).toArray(function(err, docs){

		if (docs.length > 0){
			inst_db.collection(COL_GROUP).deleteMany({'name': group, 'cust_id':1}, function(){
				if(typeof(user) == 'string'){
					user = user.toLowerCase();
					if (docs[0].member.indexOf(user) < 0){
						docs[0].member.push(user);
					}
				}
				else if(user instanceof Array){
					user.forEach(function(v,i,a){
						v = v.toLowerCase();
						if(docs[0].member.indexOf(v) < 0){
							docs[0].member.push(v);
						}
					})
				}

				inst_db.collection(COL_GROUP).insertOne({'name': group, 'member':docs[0].member, 'cust_id':1}, callback);
			});
		}
		else {
			if(typeof(user) == 'string'){
				inst_db.collection(COL_GROUP).insertOne({'name': group, 'member':[user], 'cust_id':1}, callback);
			}
			else if(user.length > 0){
				inst_db.collection(COL_GROUP).insertOne({'name': group, 'member':user, 'cust_id':1}, callback);
			}
		}
	})
}

isee_db.delMember = function(group, user, callback){
	var inst_db = this.db;

	group = group.toLowerCase();

	this.db.collection(COL_GROUP).find({'name': group, 'cust_id':1}).toArray(function(err, docs){

		if (docs.length > 0){
			inst_db.collection(COL_GROUP).deleteMany({'name': group, 'cust_id':1}, function(){

				var members = docs[0].member.filter(function(x,i,a){
					if (typeof(user) == 'string'){
						if(user.toLowerCase() == x){
							return false; //to filter out
						}
						else {
							return true;
						}
					}
					else if (user instanceof Array){
						
						for (var i=0; i<user.length; i++){
							if(user[i].toLowerCase() == x){
								return false; //to filter out
							}
						}

						return true;

					}
					else{
						return true;
					}
				});

				inst_db.collection(COL_GROUP).insertOne({'name': group, 'member':members, 'cust_id':1}, callback);
			});
		}
		else if(callback && typeof(callback) == 'function'){
			callback();
		}
	})
}


isee_db.verifyMember = function(group, user, callback){
	var inst_db = this.db;

	this.db.collection(COL_GROUP).find({'name': group, 'cust_id':1}).toArray(function(err, docs){
		if(docs.length == 0){
			if (callback && typeof(callback) == 'function'){
				callback(false);
			}
		}
		else {
			var i = 0;

			for (i=0; i<docs[0].member.length; i++){
				if(docs[0].member[i].toLowerCase() == user.toLowerCase()){
					if (callback && typeof(callback) == 'function'){
						callback(true);
					}
					return;
				}
			}
			if (callback && typeof(callback) == 'function'){
				callback(false);
			}
			return;
		}
	})
}

isee_db.getGroupList = function(user, callback){
	var inst_db = this.db;
}

isee_db.test = function(cb){
	// this.delMember('mml', 'Zhiming tang');
	//this.addMember('mml', ['zhiming tang', 'junqi xie', 'terry yin']);
	// this.verifyMember('mml', 'junqixie', function(a){console.log(a)});

	this.getSurveyComment("daoqun shan", null, null, null, function(docs){
		console.log(docs);
	})
	// this.db.collection(COL_SURVEY).find().toArray(function(err, docs){
	// 	console.log(docs);
	// })
	// var cursor = this.db.collection(COL_GROUP).find({'cust_id': 1});

	// cursor.each(function(err, doc) {
 //      assert.equal(err, null);
 //      if (doc != null) {
 //         //console.dir(doc);
 //         if (cb && typeof(cb)=='function'){
 //         	cb(doc);
 //         }
 //      } else {
 //         //console.log(doc);
 //      }
 //   });
}

module.exports = isee_db;