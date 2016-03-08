

function plot_line(cell, title, labels, curves, reference){

	var ctx = $("canvas#slot"+cell).get(0).getContext("2d");
	var myNewChart = new Chart(ctx);

	var numOfLine = curves.length;

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
    	bezierCurve: false
    }


	var lineChart = new Chart(ctx).Line(data, options);



	$('h3#slot'+cell).text(title);

	return lineChart;
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

			plot_line(1, 'Cold Start', labels.slice(0, data.cold_start.length), [{data: data.cold_start}], data.reference.cold_start);
			plot_line(2, 'Warm Start', labels.slice(0, data.warm_start.length), [{data: data.warm_start}], data.reference.warm_start);
			plot_line(3, 'Switch Mode', labels.slice(0, data.switch_mode.length), [{data: data.switch_mode}], data.reference.switch_mode);
			plot_line(4, 'Switch Camera', labels.slice(0, data.switch_camera.length), [{data: data.switch_camera}], data.reference.switch_camera);
			plot_line(5, 'Take Picture', labels.slice(0, data.capture.length), [{data: data.capture}], data.reference.capture);
			plot_line(6, 'Burst Capture', labels.slice(0, data.burst.length), [{data: data.burst}], data.reference.burst);
			plot_line(7, 'Boom Capture', labels.slice(0, data.boom.length), [{data: data.boom}], data.reference.boom);
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
				var a1 = parseInt(a[3]);
				var b1 = parseInt(b[3]);

				var a2 = a[6];
				var b2 = b[6];

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

			var ALL_TOKENS = ['cold_start', 'warm_start', 'switch_mode', 'switch_camera', 'capture', 'burst', 'boom'];
			var ALL_TITLES = ['Cold Start', 'Warm Start', 'Switch Mode', 'Switch Camera', 'Take Picture', 'Burst Capture', 'Boom Capture'];

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

			console.log(reference);

			ALL_TOKENS.forEach(function(v,i,a){
				console.log(i);
				var cellID = i+1;
				var chart = plot_line(cellID, ALL_TITLES[i], labels, [{'data': data[v]}], reference[v]);
				$('canvas#slot'+cellID).click(function(evt){
					var activePoints = chart.getPointsAtEvent(evt);
					location.href = "/performance?project="+project+"&version="+activePoints[0].label;
				})
			})
		}
	}
	request.send();
}


function test(){

	//draw_project_sw_result('idol4', 'SWA2d');

	var project = $('#dl-project').text();
	var version = $('#dl-version').text();


	if (version){
		draw_project_sw_result(project, version);
	}
	else {
		draw_project_result(project);
	}
	

	// var data = 
	// 		[
	// 			{
	// 				label:"haha", 
	// 				data:[555,716,708,703, 683, 716, 720, 756, 688, 694]
	// 			}
	// 		];


	// plot_line(1, "", ['test #1', 'test #2', 'test #3', 'test #4', 'test #5', 'test #6', 'test #7', 'test #8', 'test #9', 'test #10'], data,600);
	// plot_line(2, "", ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], data,600);
	// plot_line(3, "", ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], data,600);


}

test()