
function fillin_comment(){
	var comments = JSON.parse($('#dl-comments').text());

	comments.forEach(function(v,i,a){
		var token = "";

		switch(v.level){
			case "good":
				token = "success";
				break;
			case "bad":
				token = "warning";
				break;
			case "poor":
				token = "danger";
				break;
			default:
				token = "info"
				break;
		}

		console.log(token);
		
		var insertElement = "<tr class="+token+"><td><a href="+v.link+">"+v.scene+"</a></td><td>"+v.author+"</td><td>"+v.product+"</td><td>"+v.comment+"</td>";
		$('table').append(insertElement);
	})
}

window.setTimeout(fillin_comment, 500);
