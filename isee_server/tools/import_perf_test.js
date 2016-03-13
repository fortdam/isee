var fs = require("fs");
var process = require("process");

var isee_db = require('../database/isee_db');

function test_import(file){
	var result = {
		cold_start: [],
		cold_start_hal: [],
		warm_start: [],
		warm_start_hal: [],
		switch_mode: [],
		switch_mode_hal: [],
		switch_camera: [],
		switch_camera_hal: [],
		capture: [],
		capture_hal: [],
		burst: [],
		burst_hal: [],
		boom: [],
		boom_ui: [],
		boom_hal: [],
		cust_id: 1
	};

	var current_dataset = null;

	var content = fs.readFileSync(file).toString().split("\n");

	content.forEach(function(v,i,a){

		if (v.indexOf('[Product]') >= 0){
			var str = v.match(/\[Product\](.*)/);
			result.product = str[1].trim();
		}
		else if (v.indexOf('[Baseline]') >= 0){
			var str = v.match(/\[Baseline\](.*)/);
			result.baseline = str[1].trim();
		}
		else if (v.indexOf('[Hardware]') >= 0){
			var str = v.match(/\[Hardware\](.*)/);
			result.hardware = str[1].trim();
		}
		else if (v.indexOf('[Software]') >= 0){
			var str = v.match(/\[Software\](.*)/);
			result.software = str[1].trim();			
		}
		else if (v.indexOf('[com.tct.camera]') >= 0) {
			var str = v.match(/\[com.tct.camera\](.*)/);
			result.app = str[1].trim()
		}
		else if (v.indexOf('--Time For Camera Launch(Cold)--') >= 0){
			current_dataset = result.cold_start;
		}
		else if (v.indexOf('--Time For Camera Launch(Cold)-(HAL)--') >= 0){
			current_dataset = result.cold_start_hal;
		}
		else if (v.indexOf('--Time For Camera Launch(Warm)--') >= 0){
			current_dataset = result.warm_start;
		}
		else if (v.indexOf('--Time For Camera Launch(Warm)-(HAL)--') >= 0){
			current_dataset = result.warm_start_hal;
		}
		else if (v.indexOf('--Time For Switch Mode--') >= 0){
			current_dataset = result.switch_mode;
		}
		else if (v.indexOf('--Time For Switch Mode-(HAL)--') >= 0){
			current_dataset = result.switch_mode_hal;
		}
		else if (v.indexOf('--Time For Toggle Camera--') >= 0){
			current_dataset = result.switch_camera;
		}
		else if (v.indexOf('--Time For Toggle Camera-(HAL)--') >= 0){
			current_dataset = result.switch_camera_hal;
		}
		else if (v.indexOf('--Time For Take Picture--') >= 0){
			current_dataset = result.capture;
		}
		else if (v.indexOf('--Time For Take Picture-(HAL)--') >= 0){
			current_dataset = result.capture_hal;
		}
		else if (v.indexOf('--Time-lapse between Burst capture--') >= 0){
			current_dataset = result.burst;
		}
		else if (v.indexOf('--Time-lapse between Burst capture-(HAL)--') >= 0){
			current_dataset = result.burst_hal;
		}
		else if (v.indexOf('--Time For Instant Capture--') >= 0) {
			current_dataset = result.boom;
		}
		else if (v.indexOf('--Time For Instant Capture-(UI)--') >= 0) {
			current_dataset = result.boom_ui;
		}
		else if (v.indexOf('--Time For Instant Capture-(HAL)--') >= 0) {
			current_dataset = result.boom_hal;
		}
		else if (v.indexOf('ms')>=0 && v.indexOf('Average') < 0){
			var time = v.match(/(\d+) ms/);
			current_dataset.push(parseInt(time[1]))
		}

	})

	isee_db.open(function(){
		isee_db.addPerfTest(result, function(){isee_db.close()});
	})

}

function reference_import(){

	var PERF_REFERENCE = [
		{
			'cust_id':2,
			'product': "Idol 4",
			'cold_start': 1000, 
			'cold_start_hal': 807,
			'warm_start': 800,
			'warm_start_hal': 602,
			'switch_mode': 700,
			'switch_mode_hal': 507,
			'switch_camera': 850,
			'switch_camera_hal': 735,
			'capture': 300,
			'capture_hal': 249,
			'burst': 164,
			'burst_hal': 164,
			'boom': 1200,
			'boom_ui': 1600,
			'boom_hal': 600

		},
		{
			'cust_id':2,
			'product': "Idol 4s",
			'cold_start': 1000,
			'cold_start_hal': 830,
			'warm_start': 800,
			'warm_start_hal': 610,
			'switch_mode': 700,
			'switch_mode_hal': 484,
			'switch_camera': 850,
			'switch_camera_hal': 749,
			'capture': 300,
			'capture_hal': 277,
			'burst': 180,
			'burst_hal': 182,
			'boom':1100,
			'boom_ui': 1500,
			'boom_hal': 600
		},
		{
			'cust_id':2,
			'product': 'Idol4S VDF',
			'cold_start': 1000,
			'cold_start_hal': 830,
			'warm_start': 800,
			'warm_start_hal': 610,
			'switch_mode': 700,
			'switch_mode_hal': 484,
			'switch_camera': 850,
			'switch_camera_hal': 749,
			'capture': 300,
			'capture_hal': 277,
			'burst': 180,
			'burst_hal': 182,
			'boom':1100,
			'boom_ui':1500,
			'boom_hal': 600
		}
	];

	isee_db.open(function(){
		PERF_REFERENCE.forEach(function(v,i,a){
			isee_db.addPerfRef(v);
		})
	})
}




//Main routine starts here
if (process.argv.length < 2) {
	console.log('The command is: node import_perf_test.js <test_result_name>');
}
else {
	if (fs.existsSync(process.argv[2])){
		// read_project_info(process.argv[2]);
		test_import(process.argv[2]);
	}
	else if (process.argv[2] == 'reference'){
		reference_import();
	}
	else{
		console.log("The test result doesn't exist, please make sure the "+process.argv[2]+" exists");
	}
}
