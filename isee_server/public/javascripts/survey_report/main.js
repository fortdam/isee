
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
	insertElement = "<tr><th>Scene</th>";

	commentInfo.products.forEach(function(v,i,a){
		insertElement += "<th>"+v+"</th>";
	})

	insertElement += "</tr>";

	$('table#total').append(insertElement);

	commentInfo.indice.forEach(function(v,i,a){
		insertElement = "<tr><td style=\"padding:0\"><a href=\"/survey?propject="+commentInfo.project+"&index="+(i+1)+"\"><img style=\"height:50px\" src=\"/photos/cache/__thumb__/"+commentInfo.project+"/"+window.commentInfo.prefix[0]+"_"+commentInfo.indice[i]+".jpg"+"\"/></a></td>";

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
				var tooltip = "";
				var href = ""

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
				href = "<a href=javascript:display_breakdown("+i+","+ii+")>";


				if(score <= 3){
					insertElement += "<td class=\"poor\"";
				}
				else if(score <= 5){
					insertElement += "<td class=\"bad\"";
				}
				else if(score <= 7){
					insertElement += "<td class=\"normal\"";
				}
				else {
					insertElement += "<td class=\"good\"";					
				}

				if(href.length > 0){
					insertElement += ">"+href+score+"</a></td>";
				}
				else{
					insertElement += " >"+score+"</td>"
				}


				totalScore[ii].push(score);
			}
		}

		insertElement += "</tr>"

		$('table#total').append(insertElement);
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

	$('table#total').append(insertElement);
}

function display_breakdown(sceneIndex, productIndex){
	$('#breakdown-title').removeClass('hidden');
	$('#breakdown-title').html('Scene #'+(sceneIndex+1)+" | "+window.commentInfo.products[productIndex]);

	$('a#img').attr('href', '/photos/'+commentInfo.project+"/"+window.commentInfo.prefix[productIndex]+"_"+commentInfo.indice[sceneIndex]+".jpg");
	$('img#detail').removeClass('hidden');
	$('img#detail').attr('src', '/photos/cache/__medium__/'+commentInfo.project+"/"+window.commentInfo.prefix[productIndex]+"_"+commentInfo.indice[sceneIndex]+".jpg");
	$('table#breakdown').empty();

	var currComment = window.commentInfo.comment.filter(function(x){
		if(x.product == commentInfo.products[productIndex] && parseInt(x.index) == commentInfo.indice[sceneIndex]){
			return true;
		}
	});

	var insertElement = "";

	if(currComment.length > 0){
		insertElement = "<tr><th>User</th><th>Score</th><th>Comment</th>";
		$('table#breakdown').append(insertElement);

	}

	currComment.forEach(function(v,i,a){
		var score = parseInt(v.score);

		if(score <= 3){
			insertElement = "<tr class=\"poor\">";
		}
		else if(score <= 5){
			insertElement = "<tr class=\"bad\">";
		}
		else if(score <= 7){
			insertElement = "<tr class=\"normal\">";
		}
		else {
			insertElement = "<tr class=\"good\">";
		}

		insertElement += "<td><a href=\"/survey_report?project="+window.commentInfo.project+"&from="+v.user+"\">"+v.user+"</a></td><td>"+v.score+"</td><td>"+v.review+"</td></tr>";
		$('table#breakdown').append(insertElement);		
	});

	apply_color();
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