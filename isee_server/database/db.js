var db = {};

db.getProjectList = function () {
	return {'projects':['idol4 Subjective Test#1', 'MML Internal Test 1', "MML Internal Test 2"]};
}

db.getSceneList = function (project) {
	return {'scenes': [
		{'Outdoor': ['Morning', 'Noon', 'Afternoon', 'Night']},
		{'Indoor': ['Lab', 'Supermarket']},
		'Artifacts'
	]};
}

db.getSceneNum = function (project, scene) {

	if (scene == "Morning") {
		return 5;
	}
	else if (scene == "Noon") {
		return 5;
	}
	else if (scene == "Afternoon") {
		return 5;
	}	
	else if (scene == "Sunset") {
		return "28";
	}
	else if (scene == "Night") {
		return 5;
	}
	else if (scene == "Lab") {
		return 5;
	}
	else if (scene == "Supermarket") {
		return 5;
	}
	else if (scene == "Artifacts") {
		return "8";
	}
	else {
		return 0;
	}
}

db.getProduct = function (project) {
	return {'products': ["Idol 4", "Idol 4S", "IPhone 6", "Samsung S6"]}
}

module.exports = db;