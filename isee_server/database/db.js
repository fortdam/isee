var db = {};

db.getProjectList = function () {
	return {'projects':['idol4 Subjective Test#1', 'MML Internal Test 1', "MML Internal Test 2"]};
}

db.getSceneList = function (project) {
	return {'scenes': [
		{'outdoor': ['morning', 'noon', 'afternoon', 'sunset', 'cloudy', 'cloudy_sunset', 'night']},
		{'indoor': ['lab', 'office', 'resturaunt', 'supermarket']},
		'artifacts'
	]};
}

db.getSceneInfo = function (project, scene) {
	if (scene == "morning") {
		return {
			path:'outdoor/morning', 
			num:'28',
		};
	}
	else if (scene == "noon") {
		return {
			path:'outdoor/noon', 
			num:'18',
		}
	}
	else if (scene == "afternoon") {
		return {
			path:'outdoor/afternoon', 
			num:'28',
		}
	}	
	else if (scene == "sunset") {
		return {
			path:'outdoor/sunset', 
			num:'28',
		}
	}	
	else if (scene == "cloudy") {
		return {
			path:'outdoor/cloudy', 
			num:'25',
		}
	}
	else if (scene == "cloudy_sunset") {
		return {
			path:'outdoor/cloudy_sunset', 
			num:'25',
		}
	}
	else if (scene == "night") {
		return {
			path:'outdoor/night', 
			num:'5',
		}
	}
	else if (scene == "lab") {
		return {
			path:'indoor/lab', 
			num:'14',
		}
	}
	else if (scene == "office") {
		return {
			path:'indoor/office', 
			num:'14',
		}		
	}
	else if (scene == "resturaunt") {
		return {
			path:'indoor/resturaunt', 
			num:'4',
		}
	}
	else if (scene == "supermarket") {
		return {
			path:'indoor/supermarket', 
			num:'16',
		}
	}
	else if (scene == "artifacts") {
		return {
			path:'artifacts', 
			num:'5',
		}
	}
	else {
		return null;
	}
}

db.getProduct = function (project) {
	return {'products': ["Idol 4", "Idol 4S", "IPhone 6", "Samsung S6"]}
}

module.exports = db;