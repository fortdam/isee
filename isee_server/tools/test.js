var isee_db = require('../database/isee_db');

isee_db.open(function(){isee_db.test(function(doc){
	console.log(doc);
	console.log('-----------------------------------');

	// if (doc.cold_start_hal){

	// }
	// else {
	// 	doc.cold_start_hal = doc.cold_start.slice(0);
	// 	doc.cold_start = [];

	// 	doc.warm_start_hal = doc.warm_start.slice(0);
	// 	doc.warm_start = [];

	// 	doc.switch_mode_hal = [];

	// 	doc.switch_camera_hal = doc.switch_camera.slice(0);
	// 	doc.switch_camera = [];

	// 	doc.capture_hal = [];

	// 	doc.burst_hal = [];

	// 	doc.boom_ui = [];
	// 	doc.boom_hal = [];

	// 	isee_db.addPerfTest(doc)
	// }
})});

