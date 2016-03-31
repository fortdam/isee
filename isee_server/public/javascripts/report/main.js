
window.appData = {
	sceneOrder: 0,
	authorOrder: 0,
	productOrder: 0,
	commentOrder: 0
}

function fillin_comment(comments){

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
		
		var insertElement = "<tr class="+token+"><td><a href="+v.link+">"+v.scene+"</a></td><td>"+v.author+"</td><td>"+v.product+"</td><td>"+v.comment+"</td>";
		$('table').append(insertElement);
	})
}

function generic_cmp(a,b,order){

	if (a.localeCompare(b) <=0 && order == -1){
		return -1;
	}
	else if (a.localeCompare(b) >= 0  && order == 1){
		return -1;
	}
	else {
		return 1;
	}
}

function comment_cmp(a,b,order){
	if (a == 'good'){
		a = '3';
	}
	else if(a == 'bad'){
		a = '2';
	}
	else if (a == 'poor'){
		a = '1';
	}

	if (b == 'good'){
		b = '3';
	}
	else if(b == 'bad'){
		b = '2';
	}
	else if (b == 'poor'){
		b = '1';
	}

	return generic_cmp(a,b,order);
}


function sort_by_field(order_field ,view_id , data_field, compare_func){
	var comments = JSON.parse($('#dl-comments').text());

	switch(window.appData[order_field]){
	case -1:
		window.appData[order_field] = 1;
		break
	case 1:
		window.appData[order_field] = -1;
		break
	default:
		window.appData[order_field] = -1;
		break;
	}


	if (window.appData[order_field] == -1) {
		$('span#'+view_id).removeClass('glyphicon-triangle-top');
		$('span#'+view_id).addClass('glyphicon-triangle-bottom');
	}
	else{
		$('span#'+view_id).addClass('glyphicon-triangle-top');
		$('span#'+view_id).removeClass('glyphicon-triangle-bottom');		
	}

	$('.success').remove();
	$('.warning').remove();
	$('.danger').remove();
	$('.info').remove();


	comments.sort(function(a,b){
		return compare_func(a[data_field], b[data_field], window.appData[order_field]);
	})

	fillin_comment(comments);
}


function sort_by_scene(){
	sort_by_field('sceneOrder', 'sort-scene', 'scene', generic_cmp)
}

function sort_by_author(){
	sort_by_field('authorOrder', 'sort-author', 'author', generic_cmp);
}

function sort_by_product(){
	sort_by_field('productOrder', 'sort-product', 'product', generic_cmp);
}

function sort_by_comment(){
	sort_by_field('commentOrder', 'sort-comment', 'level', comment_cmp);
}

function hook_sort_func(){
	$('a#sort-scene').attr('href', "javascript:sort_by_scene()");
	$('a#sort-author').attr('href', "javascript:sort_by_author()");
	$('a#sort-product').attr('href', "javascript:sort_by_product()");
	$('a#sort-comment').attr('href', "javascript:sort_by_comment()");
}

function load_page_done(){
	sort_by_scene();
	hook_sort_func();
}

document.body.onload = load_page_done;

load_js('check_browser.js');
