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
		// comment: "off",
		// exif: "exif-off"
	},

	// reportSettings: {
	// 	comment: "all",
	// 	product: 15
	// },

	context: {
		firstload: true
	}
};

function load_projects() {
	var request = new XMLHttpRequest();

	request.open("GET", "/meta_data/survey?user="+window.appData.userInfo.email);
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200){
			var res = JSON.parse(request.response);

			window.appData.projectInfo.total = res;

			window.appData.context.firstload = true;


			//process deeplink
			if ($('#dl-project').html().length>0){
				var dl_project = $('#dl-project').html();
				var i = 0;
				// console.log("select project:"+dl_project);

				for(i=0; i<window.appData.projectInfo.total.length; i++){
					if(window.appData.projectInfo.total[i].test == dl_project){
						select_project(i);
						break;
					}
				}

				if(i == window.appData.projectInfo.total.length){
					select_project(0);
				}
			}
			else 
			{
				// console.log('select old project');
				select_project(0);
			}
		}
	}
	request.send();
}

function select_project(index){
	window.appData.projectInfo.curr = window.appData.projectInfo.total[index].test;
	window.appData.projectInfo.products = window.appData.projectInfo.total[index].products;
	window.appData.projectInfo.prefix = window.appData.projectInfo.total[index].prefix;

	if(window.appData.projectInfo.total[index].select == undefined){
		window.appData.projectInfo.total[index].select = [];

		for (var i=0; i<window.appData.projectInfo.total[index].total; i++){
			window.appData.projectInfo.total[index].select[i] = i+1;
		}
	}
	
	window.appData.projectInfo.pages = window.appData.projectInfo.total[index].select;

	$('.navbar-brand').html(window.appData.projectInfo.total[index].name);

	load_page();

	window.appData.context.firstload = false;
}

//
function load_page() {

	window.appData.pageInfo = {
		'total': window.appData.projectInfo.pages.length,
		'start': 1,
		'curr': undefined
	}

	window.appData.pageInfo.MAX_RANGE = Math.min(window.appData.pageInfo.total, 5);
	window.appData.pageInfo.end = Math.min(window.appData.pageInfo.total, 5);

	for (var i=1; i<=5; i++){
		if (i<=window.appData.pageInfo.MAX_RANGE){
			$('li#page-item-'+i).removeClass('hidden');
		}
		else{
			$('li#page-item-'+i).addClass('hidden');			
		}
	}

	if (window.appData.context.firstload && $('#dl-index').html().length>0){
		var dl_index = parseInt($('#dl-index').html());
		var page_index = dl_index;

		console.log(page_index);

		if (page_index >= 0){
			// console.log("successfully select page "+page_index);
			select_page(page_index);
		}
		else{
			// console.log('select old page 1')
			select_page(1);
		}
	}
	else {
		select_page(1);
	}	

}

function select_page(index){

	window.appData.projectInfo.random = randomize(window.appData.projectInfo.products.length);

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
	load_exifs();
	load_comments();

	reset_zoom();
}


function load_images(){
	var imageFilePath = '';

	var currPage = window.appData.pageInfo.curr;


	var path1 = window.appData.projectInfo.curr;


	var prefix = window.appData.projectInfo.prefix;
	var appendix = window.appData.projectInfo.pages[currPage-1];

	for (var i=0; i<prefix.length; i++){
		if (window.appData.settings.imgsize == 'small'){
			load_image("/photos/cache/__small__/"+path1+"/"+prefix[i]+"_"+appendix+".jpg", window.appData.projectInfo.random[i]);
		}
		else if (window.appData.settings.imgsize =='medium'){
			load_image("/photos/cache/__medium__/"+path1+"/"+prefix[i]+"_"+appendix+".jpg", window.appData.projectInfo.random[i]);
		}
		else if (window.appData.settings.imgsize == 'large'){
			load_image("/photos/cache/__large__/"+path1+"/"+prefix[i]+"_"+appendix+".jpg", window.appData.projectInfo.random[i]);
		}
		else{
			load_image("/photos/"+path1+"/"+prefix[i]+"_"+appendix+".jpg", window.appData.projectInfo.random[i]);
		}
	}
}

function load_image(filePath, pos) {
	$('img#pic'+pos).attr('src', filePath);
}

function load_exifs(){
	// console.log('loading exif');
	var imageFilePath = '';

	var currPage = window.appData.pageInfo.curr;

	var path1 = window.appData.projectInfo.curr; 

	var prefix = window.appData.projectInfo.prefix;
	var appendix = window.appData.projectInfo.pages[currPage-1];

	for (var i=1; i<=prefix.length; i++){
		var totalPath = "/photos/cache/__exif__/"+path1+"/"+prefix[i-1]+"_"+appendix+".exif"
		load_exif(totalPath, i);
	}


}

function load_exif(filePath, pos){
	var request = new XMLHttpRequest();
	request.open("GET", filePath);
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status === 200) {
			var res = JSON.parse(request.response);	
		
			var manufactor = res.image.Make;
			var model = res.image.Model;
			var software = res.image.Software;
			var width = res.exif.ExifImageWidth;
			var height = res.exif.ExifImageHeight;
			var shutter = res.exif.ExposureTime;
			var iso = res.exif.ISO;

			if (shutter < 0.1){
				shutter = "1/"+Math.round(1/shutter)+" sec";
			}
			else {
				shutter = shutter + " sec";
			}
			//Clear the project information

			if (software && software.length > 20){
				var newstr = software.slice(0,19);
				software = software.substr(20);
				while(software && software.length>0){
					newstr += "<br>";
					newstr += software.substr(0,19);
					software = software.substr(20);
				}
				software = newstr;
			}

			var htmlContent = " <b>Maker:</b> "+manufactor
				+"<br><b>Model:</b> "+model
				+"<br><b>Software:</b> "+software
				+"<br><b>Width:</b> "+width
				+"<br><b>Height:</b> "+height
				+"<br><b>Exposure:</b> "+shutter
				+"<br><b>ISO:</b> "+iso;

			$('#overlay'+pos).empty().append(htmlContent);
		}		
	}
	request.send();
}

function findProductName(index){
	var pos = window.appData.projectInfo.random.indexOf(index);
	return window.appData.projectInfo.products[pos];
}

function findProductPos(product){
	var index = window.appData.projectInfo.products.indexOf(product);
	return window.appData.projectInfo.random[index];
}

function load_comments(){
	var request = new XMLHttpRequest();
	var queryStr = '/questionair?'+
		'user='+window.appData.userInfo.name+
		'&email='+window.appData.userInfo.email+
		'&project='+window.appData.projectInfo.curr+
		'&index='+ window.appData.projectInfo.pages[window.appData.pageInfo.curr-1];


	for(var i=1; i<=window.appData.projectInfo.prefix.length; i++){
		$('#matrix-label-text-'+i).html('Not rated');
		$('#carousel-label-text-'+i).html('Not rated');
	}

	window.appData.comments = {};

	request.open("GET", queryStr);
	request.onreadystatechange = function() {

		if (request.readyState === 4 && request.status === 200) {
			var res = JSON.parse(request.response);	


			if(res.state == 'yes'){
				window.appData.comments = res.data;

				window.appData.comments.forEach(function(v,i,a){
					if(v.product && v.product.length>0){
						var pos = findProductPos(v.product);;

						$('#matrix-label-text-'+pos).html(v.score);
						$('#carousel-label-text-'+pos).html(v.score);
					}
				})
			}
		}
	}
	request.send();
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


function place_label() {
	var pos;
	var width;
	var width1;
	var height;
	var height2;

	var leftPadding;

	if (window.appData.settings.layout == 'matrix'){
		var totalPic = window.appData.projectInfo.prefix.length;

		for (var i=1; i<=totalPic; i++){
			pos = $(".matrix .slot"+i).offset();
			width = $(".matrix .slot"+i).width();
			width1 = $("#overlay"+i).width();
			height = $(".matrix .slot"+i).height();
			height2	= $('#comment'+i).height();
			leftPadding = parseInt($('.matrix .slot'+i).css('padding-left'));

			$("h3#label"+i).offset({top: pos.top, left:pos.left+leftPadding});
			$("#overlay"+i).offset({top: pos.top, left:pos.left+width-width1+leftPadding});
			$('#comment'+i).offset({top: pos.top+height-height2, left:pos.left+leftPadding});
			$('#comment'+i).width(width);
		}

		for(var i=1;i<=totalPic; i++){
			if (i<=window.appData.projectInfo.products.length){
				$('#matrix-label-text-'+i).removeClass('hidden');
			}
			else{
				$('#matrix-label-text-'+i).addClass('hidden');
			}
		}
	}
	else{
		var index = parseInt($('.carousel-indicators>.active').attr('data-slide-to'))+1;

		pos = $(".filmstrip").offset();
		width = $(".filmstrip").width();
		height = $(".filmstrip").height();

		$('.overlay').addClass('hidden');
		$('.comment').addClass('hidden');

		if(window.appData.settings.exif == 'exif-on'){
			$('#overlay'+index).removeClass('hidden');
			$('#overlay'+index).offset({top: pos.top, left:pos.left});			
		}

		if (window.appData.settings.comment != 'off'){
			// console.log("show comment");

			$('#comment'+index).removeClass('hidden');
			height2	= $('#comment'+index).height();

			$('#comment'+index).offset({top: pos.top+height-height2, left:pos.left});
			$('#comment'+index).width(width);
		}

		for(var i=1;i<=window.appData.projectInfo.prefix.length; i++){
			if (i<=window.appData.projectInfo.products.length){
				$('#carousel-label-text-'+i).removeClass('hidden');
			}
			else{
				$('#carousel-label-text-'+i).addClass('hidden');
			}
		}
	}
}


var modalRegistered = [];

function clearSurveyComment(){
	$("label[filter='questionair-score']").removeClass('btn-primary active');
	$("textarea").val("");

	setTimeout(function(){
        window.currModal.find("button#submit").click();
	}, 500);
}

function onModalLoaded(event) {
  var imageElt = $(event.relatedTarget);
  var pos = imageElt.attr("trigger-place");

  window.currModal = $(this);

  //Clear
  $("label[filter='questionair-score']").removeClass('btn-primary active');
  $("textarea").val("");
  $("a#revoke-button").addClass("hidden");
  $("a#revoke-button").attr('href', "javascript:clearSurveyComment()");
  

  //Fill in content if necessary
  for(var i=0; i<window.appData.comments.length; i++){
  	var index = findProductPos(window.appData.comments[i].product);

  	if (index == parseInt(pos)){
  		$("label[filter='questionair-score']").removeClass('btn-primary active');
  		$("label#score-"+window.appData.comments[i].score).addClass('btn-primary active');

  		$("textarea").val(window.appData.comments[i].review);
  		$("a#revoke-button").removeClass("hidden");
  	}
  }
  
//Cannot use such color-mask due to it doesn't sometimes
  $(this).find("label[filter='questionair-score']").bind('change', function(){
  	console.log('aaaa '+pos);
  	$("label[filter='questionair-score']").removeClass('btn-primary');
  	$("label[filter='questionair-score'].active").addClass('btn-primary');
  })

  // //TODO: Fill in the comment before...

  // // $(this).find('.modal-title-text').text('Tell us your thoughts about this picture(' + window.appData.projectInfo.products[pos-1]+')');

  var options = { 
       // target:        '#output',   // target element(s) to be updated with server response 
        beforeSubmit:  function(a,b,c){

        							if(window.appData.userInfo.name == 'guest'){
        								alert("Guest is not allowed to comment");
        								return false;
        							}

        							a[a.length] = {name:"project", value:window.appData.projectInfo.curr};
        							a[a.length] = {name:"index", value:window.appData.projectInfo.pages[window.appData.pageInfo.curr-1]};
        							a[a.length] = {name:"product", value: window.appData.projectInfo.products[window.appData.projectInfo.random.indexOf(parseInt(pos))]};
        							a[a.length] = {name:"user", value:window.appData.userInfo.name};
        							a[a.length] = {name:"email", value:window.appData.userInfo.email};
        							a[a.length] = {name:"imgsize", value:window.appData.settings.imgsize};
        							// console.log(a)
        							},  // pre-submit callback 

        complete:  		function(msg){window.currModal.modal("hide");
    								window.currModal = null;

    								load_comments();
    								return true},
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
 
 	if (modalRegistered.indexOf(pos) == -1){
 		// bind to the form's submit event 
 		modalRegistered.push(pos);
	    $(this).find('form').submit(function() { 
	        // inside event callbacks 'this' is the DOM element so we first 
	        // wrap it in a jQuery object and then invoke ajaxSubmit 
	        // console.log("trigger submit");
	        // console.log(pos);

  		    $(this).ajaxSubmit(options); 

	 
	        // !!! Important !!! 
	        // always return false to prevent standard browser submit and page navigation 
	        return false; 
	    }); 
 	}
}

function onSettingModalLoaded(event){

	var settings = window.appData.settings;

	$(this).find('#'+settings.imgsize).addClass('active btn-primary');
	$(this).find('#'+settings.layout).addClass('active btn-primary');
	$(this).find('#'+settings.comment).addClass('active btn-primary');
	$(this).find('#'+settings.exif).addClass('active btn-primary');

	$(this).find('label').change(function(){
		$("label[filter='setting']").removeClass("btn-primary");
		$("label[filter='setting'].active").addClass("btn-primary");
	});
}

function onSettingModalHide(event){
	var settings = window.appData.settings;
	var relayout = false;
	var reload = false;
	var reloadComment = false;
	var replaceLabel = false;

	if(settings.imgsize != $('label.active:eq(0)').attr('id')){
		reload = true;
	}

	if (settings.layout != $('label.active:eq(1)').attr('id')){
		relayout = true;
	}

	if (settings.comment != $('label.active:eq(2)').attr("id")){
		reloadComment = true;
	}

	if (settings.exif != $('label.active:eq(3)').attr("id")){
		replaceLabel = true;
	}

	settings.imgsize = $('label.active:eq(0)').attr('id');
	settings.layout = $('label.active:eq(1)').attr('id');
	settings.comment = $('label.active:eq(2)').attr("id");
	settings.exif = $('label.active:eq(3)').attr('id');

	localStorage.imgsize = settings.imgsize;
	localStorage.layout = settings.layout;
	localStorage.comment = settings.comment;
	localStorage.exif = settings.exif;

	if(relayout){
		console.log('relayout')
		if (settings.layout == 'matrix'){
			$('.matrix').removeClass('hidden');
			$('.filmstrip').addClass('hidden');
		}
		else{
			$('.matrix').addClass('hidden');
			$('.filmstrip').removeClass('hidden');
			$('.carousel').carousel(0);		
		}
		window.setTimeout(place_label, 500);
	}

	if (reload){
		load_images();		
	}

	if (reloadComment){
		load_comments();
	}
	
	if(!reload && !reloadComment && replaceLabel){
		place_label();
	}
}

function onDownloadModalLoaded(event){
	$(this).find('a#download-pic').attr('href', 'http://172.24.197.23:3000/photos/cache/__bundle__/'+window.appData.projectInfo.curr+'.tar.gz');
	$(this).find('a#download-apk').attr('href',"http://172.24.197.23:3000/quickreview.apk");	
}

function onLinkModalLoaded(event){

	$(this).find('p#url').text("http://172.24.197.23:3000/photos/?project="+window.appData.projectInfo.curr
											+"&scene="+window.appData.sceneInfo.total[window.appData.sceneInfo.curr].name
											+"&index="+window.appData.sceneInfo.total[window.appData.sceneInfo.curr].number[window.appData.pageInfo.curr-1]);
}

function onUserModalLoaded(event){
	var userInfo = window.appData.userInfo;

	$(this).find('input#username').attr('value', userInfo.name);
	$(this).find('input#email').attr('value', userInfo.email);


	$(this).find('#user-logout').bind('click', function(){
		document.cookie = "mail=;max-age=0;path=/";
		document.cookie = "account=;max-age=0;path=/"
		window.location.href = '/login';
	});
}

function onUserModalHide(event){
}


function preload_local_settings(){
	var list = document.cookie.split('; ');
	var cookies = {};

	for (var i=0; i<list.length; i++){
		var cookie = list[i];
		var p = cookie.indexOf('=');
		var name = cookie.substring(0,p);
		var value = cookie.substring(p+1);
		cookies[name] = value;
	}

	window.appData.userInfo.name = cookies['account'];
	window.appData.userInfo.email = cookies['mail'];

	if (localStorage.imgsize){
		window.appData.settings.imgsize = localStorage.imgsize;
	}

	if (localStorage.layout){
		window.appData.settings.layout = localStorage.layout;
	}

	if (localStorage.comment){
		window.appData.settings.comment = localStorage.comment;
	}

	if (localStorage.exif){
		window.appData.settings.exif = localStorage.exif;
	}

	if (window.appData.settings.layout == 'matrix'){
		$('.filmstrip').addClass('hidden');
	}
	else{
		$('.matrix').addClass('hidden');
		$('.carousel').carousel(0);
	}
}


function set_hook_functions(){
	document.body.onload = load_projects;//select_project('idol4');

	window.onresize = place_label;
	window.onscroll = place_label;

	for(var i=1; i<=6; i++){ //TO fix me
		$('#mySurveyModal'+i).on('show.bs.modal', onModalLoaded);
	}


	// $('#reportModal').on('show.bs.modal', onReportModalLoaded);

	// $('#downloadModal').on('show.bs.modal', onDownloadModalLoaded);
	// $('#linkModal').on('show.bs.modal', onLinkModalLoaded);

	$('#settingModal').on('show.bs.modal', onSettingModalLoaded);
	$('#settingModal').on('hide.bs.modal', onSettingModalHide);

	$('#userModal').on('show.bs.modal', onUserModalLoaded);
	$('#userModal').on('hide.bs.modal', onUserModalHide);	

	// $('#carousel-example-generic').on('slid.bs.carousel', function(){
	// 	// place_label()
	// })
}

function toggle_fullscreen(){
	// var element = document.documentElement;
	var element = document.getElementById('pic-container');

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
		// console.log('exit full screen')
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


function randomize(size){
	var output = new Array(size);

	for(var i=0; i<size; i++){
		var rand = Math.floor(Math.random()*(size-i));
		var pos = 0;

		while(output[pos]){
				//occupied, move forward
			pos++;
		}

		for(var j=0; j<rand; j++){
			pos++;
			while(output[pos]){
				//occupied, move forward
				pos++;
			}
		}
		output[pos] = i+1;
	}
	return output;
}

//Main Routine
set_hook_functions();
preload_local_settings();
window.setTimeout(place_label, 1000);


load_js('viewimage/zoom.js');
load_js('viewimage/dragable.js');

