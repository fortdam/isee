
window.appData = {
	sceneOrder: 0,
	authorOrder: 0,
	productOrder: 0,
	commentOrder: 0
}

function fillin_comment(){
	window.commentInfo = JSON.parse($('#dl-comments').text());

	console.log(commentInfo);
	console.log('sfsadfsdf')

	var totalScore = [];

	for(var i=0; i<commentInfo.products.length; i++){
		totalScore[i] = [];
	}

	var insertElement;

	//Append header
	insertElement = "<tr><th>#</th>";

	commentInfo.products.forEach(function(v,i,a){
		insertElement += "<th>"+v+"</th>";
	})

	insertElement += "</tr>";

	$('table').append(insertElement);

	commentInfo.indice.forEach(function(v,i,a){
		insertElement = "<tr><td>"+(i+1)+"</td>";

		for(var ii=0; ii<commentInfo.products.length; ii++){
			var entries = commentInfo.comment.filter(function(x){
				if(x.product == commentInfo.products[ii] && 
					parseInt(x.index) == commentInfo.indice[i]) {
					return true;
				}
				else {
					return false;
				}
			});

			if(entries.length == 0){
				insertElement += "<td class=\"na\">n/a</td>";
			}
			else {
				var score;

				if(entries.length > 1){
					console.log(entries);
					score = 0;
					var effectiveEle = 0;
					entries.forEach(function(v,i,a){
						if (v.score && v.score>=1 && v.score<=10){
							score += parseInt(v.score);
							effectiveEle += 1;
						}
					})
					score = (score/effectiveEle).toFixed(1);
				}
				else {
					score = parseInt(entries[0].score);
				}

				if(score <= 3){
					insertElement += "<td class=\"poor\">"+score+"</td>";
				}
				else if(score <= 5){
					insertElement += "<td class=\"bad\">"+score+"</td>";
				}
				else if(score <= 7){
					insertElement += "<td class=\"normal\">"+score+"</td>";
				}
				else {
					insertElement += "<td class=\"good\">"+score+"</td>";					
				}

				totalScore[ii].push(score);
			}
		}

		insertElement += "</tr>"

		$('table').append(insertElement);
	});

	insertElement = "<tr><td><b>Avg.</b></td>";

		console.log(totalScore);

	for(var i=0; i<totalScore.length; i++){
		var score;
		if(totalScore[i].length == 0){
			score = "n/a";
		}
		else {
			var result = totalScore[i].reduce(function(x,y){return parseFloat(x)+parseFloat(y)});
			score = (result/totalScore[i].length).toFixed(1);

		}

		if(score == "na"){
			insertElement += "<td class=\"na\"><b>"+score+"</b></td>";			
		}
		else if(score <= 3){
			insertElement += "<td class=\"poor\"><b>"+score+"</b></td>";
		}
		else if(score <= 5){
			insertElement += "<td class=\"bad\"><b>"+score+"</b></td>";
		}
		else if(score <= 7){
			insertElement += "<td class=\"normal\"><b>"+score+"</b></td>";
		}
		else {
			insertElement += "<td class=\"good\"><b>"+score+"</b></td>";					
		}

	}
	insertElement += "</tr>"

	$('table').append(insertElement);
}

function apply_color(){
	$('.poor').addClass('danger');
	$('.bad').addClass('warning');
	$('.good').addClass('success');
}


function load_page_done(){
	fillin_comment();
	apply_color();
}

document.body.onload = load_page_done;