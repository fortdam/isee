

function plot_line(cell, title, labels, curves, reference){
	var ctx = $("canvas#slot"+cell).get(0).getContext("2d");
	var myNewChart = new Chart(ctx);

	var numOfLine;

	if(curves && typeof(curves) == "array"){
		numOfLine = curves.length;
	} 
	else {
		numOfLine = 0;
	}

	var fillColors = ["rgba(255,0,0,0)", "rgba(151,187,205,0)"];
	var strokeColors = ["rgba(255,0,0,1)", "rgba(151,187,205,1)"];
	var pointColors = ["rgba(255,0,0,1)", "rgba(151,187,205,1)"];
	var pointStrokeColors = ["#fff", "#fff"];
	var pointHighlightFills = ["#fff", "#fff"];
	var pointHighlightStrokes = ["rgba(255,0,0,1)", "rgba(151,187,205,1)"]


	var data = {
		'labels': labels,
		'datasets': []
	}

	if (reference){
		var arr = new Array(labels.length);
		for(var i=0; i<arr.length; i++){
			arr[i] = reference;
		}


		var entry = {
			label: 'reference data',
			fillColor: fillColors[0],
			strokeColor: strokeColors[0],
			pointColor: pointColors[0],
			pointStrokeColor: pointHighlightStrokes[0],
			pointHighlightFill: pointHighlightFills[0],
			pointHighlightStroke: pointHighlightStrokes[0],
			data: arr
		}

		data.datasets.push(entry);
	}

	curves.forEach(function(v,i,a){
		while (v.data.length < labels.length){
			v.data.push(0);
		}

		if (v.data.length > labels.length){
			v.data.slice(0, labels.length);
		}

		var entry = {
			label: v.label,
			fillColor: fillColors[i+1],
			strokeColor: strokeColors[i+1],
			pointColor: pointColors[i+1],
			pointStrokeColor: pointHighlightStrokes[i+1],
			pointHighlightFill: pointHighlightFills[i+1],
			pointHighlightStroke: pointHighlightStrokes[i+1],
			data: v.data
		}
		data.datasets.push(entry);
	})

    var options = {
    	scaleLabel: "<%=value%> ms",
    	bezierCurve: false,
    }


	var lineChart = new Chart(ctx).Line(data, options);



	$('h3#slot'+cell).text(title);
	$('h3#slot'+cell).attr('title', 'hahahaha adsfjsroawefs;');

	return lineChart;
}

var ALL_TOKENS = ['cold_start', 'cold_start_hal', 'warm_start', 'warm_start_hal',  'switch_mode', 'switch_mode_hal', 'switch_camera', 'switch_camera_hal','capture', 'capture_hal','burst', 'burst_hal', 'boom', 'boom_ui', 'boom_hal'];
var ALL_TITLES = ['Cold Start', 'Cold Start(HAL)', 'Warm Start', 'Warm Start(HAL)', 'Switch Mode', 'Switch Mode(HAL)','Switch Camera', 'Switch Camera(HAL)', 'Take Picture', 'Take Picture(HAL)','Burst Capture', 'Burst Capture(HAL)', 'Boom Capture', 'Boom Capture(UI Display)', 'Boom Capture(HAL)'];
var CELL_IDS = [11, 12, 21, 22, 31, 32, 41, 42, 51, 52, 61, 62, 71, 72, 73]

var ALL_DESC = [
	"APP start --> Start preview and first frame displayed", //cold start
	"(HAL)Camera open --> Start preview and first frame ready", //cold start hal
	"APP resume --> Start preiew and first frame displayed", //warm start
	"(HAL)Camera open --> Start prview and first frame ready", //warm start hal
	"User swipe --> Restart preview and first frame displayed for new mode", //mode switch
	"(HAL) Preview stop --> Restart preview and first frame available for new mode", //mode switch hal
	"User click toggle camera --> Restart preview and first frame available for the other camera", //camera switch
	"(HAL) Camera stop --> Restart preview and first frame available for the other camera", //camera switch hal
	"User click capture --> Capture animation start",//capture
	"(HAL) Take picture --> JPEG done ",//capture hal
	"Everytime number indicator updtate",//burst
	"(HAL) Everytime JPEG done",//burst hal
	"User (double) click boom --> Picture take",//boom
	"User (double) click boom --> Display the photo",//boom ui,
	"(HAL) Open camera -> JPEG done"//boom hal
];

function update_description() {
	ALL_TITLES.forEach(function(v,i,a){
		$('table#test-desc').append('<tr><td>'+v+'</td><td>'+ALL_DESC[i]+'</td></tr>')
	})
	
}

function draw_project_sw_result(project, version){
	var request = new XMLHttpRequest();
	request.open("GET", "/meta_data/performance?project="+project+"&ver="+version);
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200){
			var res = JSON.parse(request.response);

			var data = res[0];

			console.log(data);

			var labels = ['#1', '#2', '#3', '#4', '#5', '#6', '#7', '#8', '#9', '#10', '#11', '#12', '#13', '#14', '#15', '#16', '#17', '#18', '#19', '#20'];

			$('#header-product').text(data.product);
			$('#header-hw').text('-Hardware: '+data.hardware);
			$('#header-sw').text('-Software: '+data.software);
			$('#header-baseline').text('-Baseline: '+data.baseline);
			$('#header-cam-app').text('-com.tct.camera: '+data.app);

			ALL_TITLES.forEach(function(v,i,a){
				$('table#test-desc').append('<tr><td><b>'+v+'</b></td><td>'+ALL_DESC[i]+'</td></tr>')
			})

			ALL_TITLES.forEach(function(v,i,a){
				var token = ALL_TOKENS[i];
				var title = v;
				var cellId = CELL_IDS[i];
				console.log(token);
				plot_line(cellId, title, labels.slice(0, data[token].length), [{data: data[token]}], data.reference[token]);
			})
		}
	}
	request.send();
}


function draw_project_result(project){
	var request = new XMLHttpRequest();
	request.open("GET", "/meta_data/performance?project="+project);
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200){
			var res = JSON.parse(request.response);

			console.log(res);

			var reference = res[0].reference;


			res.sort(function(a,b){
				var a1 = parseInt(a.software[3]);
				var b1 = parseInt(b.software[3]);

				var a2 = a.software[6];
				var b2 = b.software[6];

				if (a1 < b1){
					return -1;
				}
				else if (a1 > b1){
					return 1;
				}
				else if (a2 < b2){
					return -1;
				}
				else {
					return 1;
				}
			});


			var data = {};


			ALL_TOKENS.forEach(function(v,i,a){
				data[v] = []; //Initialize the data
			})


			var labels = [];

			res.forEach(function(v,i,a){
				var v1 = v.software[3];
				var v2 = v.software[6];

				labels.push('SWA'+v1+v2);

				var len;

				ALL_TOKENS.forEach(function(token, ii, ia){
					var len = v[token].length;

					if (len > 0){
						data[token].push((v[token].reduce(function(x,y){return x+y}))/len)
					}
					else {
						data[token].push(0);
					}
				})						
			})

			$('#header-product').text(res[0].product);

			// console.log(reference);

			ALL_TITLES.forEach(function(v,i,a){
				$('table#test-desc').append('<tr><td><b>'+v+'</b></td><td>'+ALL_DESC[i]+'</td></tr>')
			})

			ALL_TOKENS.forEach(function(v,i,a){
				console.log(ALL_TITLES[i]);
				var chart = plot_line(CELL_IDS[i], ALL_TITLES[i], labels, [{'data': data[v]}], reference[v]);
				$('canvas#slot'+CELL_IDS[i]).click(function(evt){
					var activePoints = chart.getPointsAtEvent(evt);
					location.href = "/performance?project="+project+"&version="+activePoints[0].label;
				})
			})
		}
	}
	request.send();
}


function main(){
	var project = $('#dl-project').text();
	var version = $('#dl-version').text();

	if (version){
		draw_project_sw_result(project, version);
	}
	else {
		draw_project_result(project);
	}
}

main();