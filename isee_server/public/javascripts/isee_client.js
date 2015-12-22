

var appData = {
	fullscreen: false,
	projectInfo: {
		curr: undefined
	},
	sceneInfo: {
		curr: undefined
	},
	pageInfo: {
		curr: undefined
	},
	userInfo: {
		name: "",
		email: ""
	},
	settings: {
		imgsize: "large",
		layout: "matrix",
		comment: "off"
	}
};

function load_projects() {
	var request = new XMLHttpRequest();
	request.open("GET", "/meta_data/project");
	request.onreadystatechange = function() {
		var res = JSON.parse(request.response);	
		//Clear the project information
		window.appData.projectInfo.total = [];
		$('#project-links').empty();

		//Enumerate all the projects
		Object.keys(res).forEach(function(val, index, array){
			$('#project-links').append("<li><a href=\"#\" class=\"dropdown-toggle\" data-toggle=\"dropdown\">"+val+"</a><ul class=\"dropdown-menu\" id=\"project_"+index+"\"></li>");

			res[val].forEach(function(v,i,a){
				var offset = window.appData.projectInfo.total.indexOf(v.test);
				if(offset === -1){
					window.appData.projectInfo.total[window.appData.projectInfo.total.length] = v.test;
					offset = window.appData.projectInfo.total.length-1;
				}
				$('ul#project_'+index).append("<li><a href=\"javascript:select_project_num("+offset+")\">"+v.name+"</li>");
			});
		});

		select_project(window.appData.projectInfo.total[1]);
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
			// console.log("get product");
			var res = JSON.parse(request.response);
			window.appData.projectInfo.products = res.products;
			window.appData.projectInfo.prefix = res.prefix;

			$('#matrix-label-text-1').html(window.appData.projectInfo.products[0]);
			$('#carousel-label-text-1').html(window.appData.projectInfo.products[0]);
			$('#matrix-label-text-2').html(window.appData.projectInfo.products[1]);
			$('#carousel-label-text-2').html(window.appData.projectInfo.products[1]);
			$('#matrix-label-text-3').html(window.appData.projectInfo.products[2]);
			$('#carousel-label-text-3').html(window.appData.projectInfo.products[2]);
			$('#matrix-label-text-4').html(window.appData.projectInfo.products[3]);
			$('#carousel-label-text-4').html(window.appData.projectInfo.products[3]);

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
						// console.log(scenes[ii]);
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
					// console.log("hahah:"+x);
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
	// console.log("select_page");

	var pageInfo = window.appData.pageInfo;

	if (index > pageInfo.total || index < 1 || index == pageInfo.curr){
		// console.log("unused")
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
		// console.log("Re-contruct the page...");
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

// console.log(window.appData.projectInfo.prefix);
	for (var i=1; i<=prefix.length; i++){
		if (window.appData.settings.imgsize == 'small'){
			load_image("/photos/cache/__small__/"+path1+"/"+path2+"/"+prefix[i-1]+"_"+appendix+".jpg", i);
		}
		else if (window.appData.settings.imgsize =='medium'){
			load_image("/photos/cache/__medium__/"+path1+"/"+path2+"/"+prefix[i-1]+"_"+appendix+".jpg", i);
		}
		else if (window.appData.settings.imgsize == 'large'){
			load_image("/photos/cache/__large__/"+path1+"/"+path2+"/"+prefix[i-1]+"_"+appendix+".jpg", i);
		}
		else{
			load_image("/photos/"+path1+"/"+path2+"/"+prefix[i-1]+"_"+appendix+".jpg", i);
		}
	}
}

function load_image(filePath, pos) {
	$('img#pic'+pos).attr('src', filePath);
	$('img#pic'+pos).onload = place_label;place_label
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
        							a[a.length] = {name:"project", value:window.appData.projectInfo.curr};
        							a[a.length] = {name:"scene", value:window.appData.sceneInfo.curr};
        							a[a.length] = {name:"index", value:window.appData.pageInfo.curr};
        							a[a.length] = {name:"product", value:window.appData.projectInfo.products[pos-1]};
        							a[a.length] = {name:"user", value:window.userInfo.name};
        							a[a.length] = {name:"email", value:window.userInfo.email};
        							a[a.length] = {name:"imgsize", value:window.settings.imgsize};
        							// console.log(a)
        							},  // pre-submit callback 

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

function onSettingModalLoaded(event){

	var settings = window.appData.settings;

	$(this).find('#'+settings.imgsize).addClass('active btn-primary');
	$(this).find('#'+settings.layout).addClass('active btn-primary');

	console.log("commment is:"+settings.comment);
	$(this).find('#'+settings.comment).addClass('active btn-primary');

	$(this).find('label').change(function(){
		$("label[filter='setting']").removeClass("btn-primary");
		$("label[filter='setting'].active").addClass("btn-primary");
	});
}

function onSettingModalHide(event){
	var settings = window.appData.settings;
	var relayout = false;
	var reload = false

	if(settings.imgsize != $('label.active:eq(0)').attr('id')){
		reload = true;
	}

	if (settings.layout != $('label.active:eq(1)').attr('id')){
		relayout = true;
	}

	settings.imgsize = $('label.active:eq(0)').attr('id');
	settings.layout = $('label.active:eq(1)').attr('id');
	settings.comment = $('label.active:eq(2)').attr("id");

	localStorage.imgsize = settings.imgsize;
	localStorage.layout = settings.layout;
	localStorage.comment = settings.comment;

	if(relayout){
		if (settings.layout == 'matrix'){
			$('.matrix').removeClass('hidden');
			$('.filmstrip').addClass('hidden');
		}
		else{
			$('.matrix').addClass('hidden');
			$('.filmstrip').removeClass('hidden');			
		}
		window.setTimeout(place_label, 500);
	}

	if (reload){
		load_images();		
	}
}

function onUserModalLoaded(event){

	var userInfo = window.appData.userInfo;

	console.log(userInfo.name);

	$(this).find('input#username').attr('value', userInfo.name);
	$(this).find('input#email').attr('value', userInfo.email);
}

function onUserModalHide(event){
	var userInfo = window.appData.userInfo;

	userInfo.name = $(this).find('input#username').val();
	localStorage.username = userInfo.name;

	userInfo.email = $(this).find('input#email').val();
	localStorage.email = userInfo.email;
}


function preload_local_settings(){
	if (localStorage.username){
		window.appData.userInfo.name = localStorage.username;
	}

	if (localStorage.email){
		window.appData.userInfo.email = localStorage.email;
	}

	if (localStorage.imgsize){
		window.appData.settings.imgsize = localStorage.imgsize;
	}

	if (localStorage.layout){
		window.appData.settings.layout = localStorage.layout;
	}

	if (localStorage.comment){
		window.appData.settings.comment = localStorage.comment;
	}

	if (window.appData.settings.layout == 'matrix'){
		$('.filmstrip').addClass('hidden');
	}
	else{
		$('.matrix').addClass('hidden');
	}
}


function set_hook_functions(){
	document.body.onload = load_projects;//select_project('idol4');

	window.onresize = place_label;
	window.onscroll = place_label;

	$('#myModal1').on('show.bs.modal', onModalLoaded);
	$('#myModal2').on('show.bs.modal', onModalLoaded);
	$('#myModal3').on('show.bs.modal', onModalLoaded);
	$('#myModal4').on('show.bs.modal', onModalLoaded);

	$('#settingModal').on('show.bs.modal', onSettingModalLoaded);
	$('#settingModal').on('hide.bs.modal', onSettingModalHide);

	$('#userModal').on('show.bs.modal', onUserModalLoaded);
	$('#userModal').on('hide.bs.modal', onUserModalHide);	
}

function toggle_fullscreen(){
	var element = document.documentElement;

	if (window.appData.fullscreen === false){
		if (element.requestFullScreen){
			element.requestFullScreen();
		}
		else if(element.mozRequestFullScreen){
			element.mozRequestFullScreen();
		}
		else if(element.webkitRequestFullscreen){
			element.webkitRequestFullscreen();
		}
		else if(element.msRequestFullScreen){
			element.msRequestFullScreen();
		}
		$('.glyphicon-resize-full').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		window.appData.fullscreen = true;
	}
	else{
		console.log('exit full screen')
		if(document.exitFullScreen){
			document.exitFullScreen();
		} 
		else if(document.mozCancelFullScreen){
		    document.mozCancelFullScreen();
		} 
		else if(document.webkitExitFullscreen){
		    document.webkitExitFullscreen();
		} 
		else if(document.msExitFullScreen){
			document.msExitFullScreen();
		}		

		$('.glyphicon-resize-small').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		window.appData.fullscreen = false;
	}	
}

document.addEventListener("fullscreenchange", function( event ) {
	if (!document.fullscreenElement) {
    	$('.glyphicon-resize-small').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		window.appData.fullscreen = false;
  	} 
  	else {
  		$('.glyphicon-resize-full').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		window.appData.fullscreen = true;
  	}
});

document.addEventListener("mozfullscreenchange", function( event ) {
	if (!document.mozFullScreen) {
    	$('.glyphicon-resize-small').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		window.appData.fullscreen = false;
  	} 
  	else {
  		$('.glyphicon-resize-full').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		window.appData.fullscreen = true;
  	}
});

document.addEventListener("webkitfullscreenchange", function( event ) {
	if (!document.webkitIsFullScreen) {
    	$('.glyphicon-resize-small').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		window.appData.fullscreen = false;
  	} 
  	else {
  		$('.glyphicon-resize-full').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		window.appData.fullscreen = true;
  	}
});

document.addEventListener("msfullscreenchange", function( event ) {
	if (!document.msFullscreenElement) {
    	$('.glyphicon-resize-small').removeClass('glyphicon-resize-small').addClass('glyphicon-resize-full');
		window.appData.fullscreen = false;
  	} 
  	else {
  		$('.glyphicon-resize-full').removeClass('glyphicon-resize-full').addClass('glyphicon-resize-small');
		window.appData.fullscreen = true;
  	}
});


//Main Routine
set_hook_functions();
preload_local_settings();
window.setTimeout(place_label, 500);
