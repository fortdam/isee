

var appData = {
	'projectInfo': {
		curr: undefined
	},
	'sceneInfo': {
		curr: undefined
	},
	'pageInfo': {
		curr: undefined
	}

};

function load_projects() {
	var request = new XMLHttpRequest();
	request.open("GET", "/meta_data/project");
	request.onreadystatechange = function() {
		var res = JSON.parse(request.response);
		window.appData.projectInfo.total = res.projects;

		$('#project-links').empty();
		for (var i=0; i<window.appData.projectInfo.total.length; i++){
			$('#project-links').append("<li><a href=\"javascript:select_project_num("+i+")\">"+window.appData.projectInfo.total[i]+"</li>");
		}

		select_project(window.appData.projectInfo.total[0]);
	}
	request.send();
}

function select_project_num(index){
	select_project(window.appData.projectInfo.total[index]);
}

function select_project(project) {
	var request = new XMLHttpRequest();
	window.appData.projectInfo.curr = project;

	request.open("GET", "/meta_data/product?project="+project);
	request.onreadystatechange = function(){
		if (request.readyState === 4 && request.status === 200){
			console.log("get product");
			var res = JSON.parse(request.response);
			window.appData.projectInfo.products = res.products;
			window.appData.projectInfo.prefix = res.prefix;

			$('#label-text-1').html(window.appData.projectInfo.products[0]);
			$('#label-text-2').html(window.appData.projectInfo.products[1]);
			$('#label-text-3').html(window.appData.projectInfo.products[2]);
			$('#label-text-4').html(window.appData.projectInfo.products[3]);

			load_scene();
		}
	}
	request.send();
}

function load_scene() {
	var request = new XMLHttpRequest();
	var project = window.appData.projectInfo.curr;

	request.open('GET', "/meta_data/scene?project="+project);
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {
			var res = JSON.parse(request.response);
			window.appData.sceneInfo.total = [];

			//remove all existing elements in nav bar...
			$('.nav-tabs').empty();

			res.scenes.forEach(function (x,i,a) {
				if(typeof x == 'object') {
					var name = Object.keys(x)[0];

					var str =  "<li class=\"dropdown\">\
        							<a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">\
        								<p class=\"text-capitalize\">"+name+"<b class=\"caret\"></b></p>\
        							</a>\
        							<ul class=\"dropdown-menu\">";

					var scenes = x[name];
					for (var ii=0; ii<scenes.length; ii++) {
						console.log(scenes[ii]);
						var allScenes = window.appData.sceneInfo.total;
						allScenes[allScenes.length] = scenes[ii];
						
						str += "<li><a href=\"javascript:select_scene_num("+(allScenes.length-1)+")\"><p class=\"text-capitalize\">"+scenes[ii]+"</p></a></li>"
					}

       				str += "</ul></li>"

					var curTab = $('.nav-tabs').append(str);
					

				}
				else if (typeof x == 'string') {
					var allScenes = window.appData.sceneInfo.total;
					allScenes[allScenes.length] = x;

					$('.nav-tabs').append("<li><a href=\"javascript:select_scene_num("+(allScenes.length-1)+")\"><p class=\"text-capitalize\">"+x+"</p></a></li>");
					console.log("hahah:"+x);
				}

			})
			
			select_scene(window.appData.sceneInfo.total[0]);  
		}
	}

	request.send(null);	
}

function select_scene_num(index){
	select_scene(window.appData.sceneInfo.total[index]);
}

function select_scene(scene){
	window.appData.sceneInfo.curr = scene;
	load_page();
}

//
function load_page() {
	var request = new XMLHttpRequest();
	var project = window.appData.projectInfo.curr;
	var scene = window.appData.sceneInfo.curr;

	request.open('GET', "/meta_data/scene_info?project="+project+"&scene="+scene);

	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {
			var res = JSON.parse(request.response);

			window.appData.sceneInfo.currPath = res.path;
			window.appData.pageInfo = {
				'total': parseInt(res.num),
				'start': 1,
				'end': 5,
				'curr': undefined,
				MAX_RANGE: 5  //FIXME: to calculate the MAX range on the fly...
			}

			select_page(1);
		}
	}

	request.send(null);	
}

function select_page(index){
	console.log("select_page");

	var pageInfo = window.appData.pageInfo;

	if (index > pageInfo.total || index < 1 || index == pageInfo.curr){
		console.log("unused")
		return;
	}

	var numElt = Math.min(pageInfo.MAX_RANGE, pageInfo.total);
	var indexUpdated = false;

	if (pageInfo.curr === undefined){
		indexUpdated = true; //undefined, load new scenes
	}

	pageInfo.curr = index;
	if (index < pageInfo.start){
		if ((index-numElt+1) >= 1){
			pageInfo.start = index - numElt + 1;
			pageInfo.end = index;
		}
		else {
			pageInfo.start = 1;
			pageInfo.end = numElt;
		}
		indexUpdated = true;
	}
	else if(index > pageInfo.end){
		if((index+numElt-1) <= pageInfo.total){
			pageInfo.start = index;
			pageInfo.end = index + numElt - 1;
		}
		else{
			pageInfo.end = pageInfo.total;
			pageInfo.start = pageInfo.total - numElt + 1;
		}
		indexUpdated = true;
	}

	if (indexUpdated) {
		console.log("Re-contruct the page...");
		for (var i=0; i<numElt; i++){
			$("a#page-index-"+(i+1)).attr("href", "javascript:select_page("+(i+pageInfo.start)+")");
			$("a#page-index-"+(i+1)).text(i+pageInfo.start);
		}		

		if (pageInfo.start > 1){
			$("a#page-prev-arrow").attr("href", "javascript:select_page("+(pageInfo.start-1)+")");
			$("li#page-prev").removeClass("disabled");
		}
		else {
			$("li#page-prev").addClass("disabled");
		}

		if (pageInfo.end < pageInfo.total){
			$("a#page-next-arrow").attr("href", "javascript:select_page("+(pageInfo.end+1)+")");
			$("li#page-next").removeClass("disabled");
		}
		else{
			$("li#page-next").addClass("disabled");
		}
	}

	var activeIndex = pageInfo.curr - pageInfo.start + 1;
	for (var i=1; i<numElt+1; i++){
		if (activeIndex == i){
			$("li#page-item-"+i).addClass("active");
		}
		else {
			$("li#page-item-"+i).removeClass("active");
		}
	}

	load_images();
}

function load_images(){
	var imageFilePath = '';

	var path1 = window.appData.projectInfo.curr;
	var path2 = window.appData.sceneInfo.currPath; 
	var prefix = window.appData.projectInfo.prefix;
	var appendix = window.appData.pageInfo.curr;

console.log(window.appData.projectInfo.prefix);
	for (var i=1; i<=prefix.length; i++){
		load_image("/photos/"+path1+"/"+path2+"/"+prefix[i-1]+"_"+appendix+".jpg", i);
	}
}

function load_image(filePath, pos) {
	var elt = document.getElementById("pic"+pos);
	elt.src=filePath;
	elt.onload = place_label;
}

function xy(x) {
    o = document.getElementById(x);
    var l =o.offsetLeft; var t = o.offsetTop;
    while (o=o.offsetParent)
    	l += o.offsetLeft;
    o = document.getElementById(x);
    while (o=o.offsetParent)
    	t += o.offsetTop;
    return [l,t];
}

function load_exif(test, scene, index, product, cb) {

}

function place_label() {
	var pos;

	pos = $("img#pic1").offset();
	$("h3#label1").offset({top: pos.top, left:pos.left});

	pos = $("img#pic2").offset();
	$("h3#label2").offset({top: pos.top, left:pos.left});

	pos = $("img#pic3").offset();
	$("h3#label3").offset({top: pos.top, left:pos.left});

	pos = $("img#pic4").offset();
	$("h3#label4").offset({top: pos.top, left:pos.left});
}

function onModalLoaded(event) {
  var imageElt = $(event.relatedTarget);
  var pos = imageElt.attr("trigger-place");

  window.currModal = $(this);
  

  $(this).find('.modal-title-text').text('Tell us your thoughts about this picture(' + window.appData.projectInfo.products[pos-1]+')');


  var options = { 
       // target:        '#output',   // target element(s) to be updated with server response 
        beforeSubmit:  function(a,b,c){
        							a[a.length] = {name:"user", value:"Jimmy"};
        							a[a.length] = {name:"project", value:window.appData.projectInfo.curr};
        							a[a.length] = {name:"scene", value:window.appData.sceneInfo.curr};
        							a[a.length] = {name:"index", value:window.appData.pageInfo.curr};
        							a[a.length] = {name:"product", value:window.appData.projectInfo.products[pos-1]}
        							console.log(a)},  // pre-submit callback 

        complete:  		function(msg){window.currModal.modal("hide");
    								window.currModal = null},
        resetForm: true, 
        clearForm: true,
        dataType:  'json',
 
        // other available options: 
        //url:       url         // override for form's 'action' attribute 
        //type:      type        // 'get' or 'post', override for form's 'method' attribute 
        //dataType:  null        // 'xml', 'script', or 'json' (expected server response type) 
        //clearForm: true        // clear all form fields after successful submit 
        //resetForm: true        // reset the form after successful submit 
 
        // $.ajax options can be used here too, for example: 
        timeout:   3000 
    }; 
 
    // bind to the form's submit event 
    $(this).find('form').submit(function() { 
        // inside event callbacks 'this' is the DOM element so we first 
        // wrap it in a jQuery object and then invoke ajaxSubmit 
        $(this).ajaxSubmit(options); 
 
        // !!! Important !!! 
        // always return false to prevent standard browser submit and page navigation 
        return false; 
    }); 
}

document.body.onload = load_projects();//select_project('idol4');

window.onresize = place_label
window.onscroll = place_label;

$('#myModal1').on('show.bs.modal', onModalLoaded);
$('#myModal2').on('show.bs.modal', onModalLoaded);
$('#myModal3').on('show.bs.modal', onModalLoaded);
$('#myModal4').on('show.bs.modal', onModalLoaded);