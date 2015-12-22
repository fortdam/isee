var db = {};

db.getProjectList = function () {
	return {'Idol3': [{
				'name': 'VQI test #1',
				'test':'idol3_151210'}],
			'Idol4': [{
				'name': 'Subjective - Rear #1',
				'test': 'idol4_151207'}],
			'Idol4S': [{
				'name': 'Subjective - Rear #1',
				'test': 'idol4_151207'}]
			}

}

db.getSceneList = function (project) {
	if (project == 'idol4_151207'){
		return {'scenes': [
			{'outdoor': ['morning', 'noon', 'afternoon', 'sunset', 'cloudy', 'cloudy_sunset', 'night']},
			{'indoor': ['lab', 'office', 'resturaunt', 'supermarket']},
			'artifacts'
		]};
	}
	else if (project == 'idol3_151210'){
		return {'scenes': ['VQI 1st Release']}
	}

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
	else if (scene == "VQI 1st Release") {
		return {
			path: 'VQI',
			num: '6'
		}
	}
	else {
		return null;
	}
}

db.getProduct = function (project) {
	if (project == 'idol4_151207'){
		return {'products': ["Idol 4", "Idol 4S", "IPhone 6S", "Samsung S6"],
				'prefix': ['idol4', 'idol4S', 'iphone', 'samsung']};
	}
	else if (project == 'idol3_151210'){
		return {'products': ["3M2 TCL", "3M2 VQI", "214 TCL", "214 VQI"],
				'prefix': ['3M2_OLD', "3M2_VQI", "214_OLD", "214_VQI"]};
	}
	
}

db.sendComment = function (comment){
	console.log(JSON.stringify(comment));
}

module.exports = db;