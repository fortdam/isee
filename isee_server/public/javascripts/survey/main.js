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
						select_project(0);
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
	window.appData.context.firstload = false;
	window.appData.projectInfo.curr = window.appData.projectInfo.total[index].test;
	window.appData.projectInfo.products = window.appData.projectInfo.total[index].products;
	window.appData.projectInfo.prefix = window.appData.projectInfo.total[index].prefix;
	window.appData.projectInfo.pages = window.appData.projectInfo.total[index].total;

	$('.navbar-brand').html(window.appData.projectInfo.total[index].name);

	load_page();
}

//
function load_page() {

	window.appData.pageInfo = {
		'total': window.appData.projectInfo.pages,
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
		var page_index = window.appData.sceneInfo.total[window.appData.sceneInfo.curr].number.indexOf(dl_index);

		// console.log(page_index);

		if (page_index >= 0){
			// console.log("successfully select page "+page_index);
			select_page(page_index+1);
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
	if(window.appData.settings.comment != 'off'){
		load_comments();
	}
}


function load_images(){
	var imageFilePath = '';

	var currPage = window.appData.pageInfo.curr;


	var path1 = window.appData.projectInfo.curr;


	var prefix = window.appData.projectInfo.prefix;
	var appendix = currPage;

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
	var appendix = currPage;

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

function load_comments(){
	var query = {};
	if (window.appData.settings.comment == 'mml'){
		query.user = "mml";
	}
	else{
		query.user = window.appData.userInfo.name;
	}

	query.project = window.appData.projectInfo.curr;
	query.scene = window.appData.sceneInfo.total[window.appData.sceneInfo.curr].name;
	query.index = window.appData.sceneInfo.total[window.appData.sceneInfo.curr].number[window.appData.pageInfo.curr-1];

	for (var i=1; i<=window.appData.projectInfo.products.length; i++){
		query.product = window.appData.projectInfo.products[i-1];
		load_comment(query, i);
	}
}

function load_comment(query, pos){
	var request = new XMLHttpRequest();
	var queryStr = '/comment?'+
		'user='+query.user+
		'&project='+query.project+
		'&scene='+query.scene+
		'&index='+query.index+
		'&product='+query.product;

	request.open("GET", queryStr);
	request.onreadystatechange = function() {

		if (request.readyState === 4 && request.status === 200) {
			var res = JSON.parse(request.response);	
	
			if(res.state == 'no'){
				//Always hide the info
				$('#comment'+pos).empty();
			}
			else {
				//Fill in the content and display if needed
				if (res.grade == 'good'){
					$('#comment'+pos).css('background-color', 'green');
					$('#comment'+pos).css('color', 'white');
				}
				else if(res.grade == 'poor'){
					$('#comment'+pos).css('background-color', 'red');
					$('#comment'+pos).css('color', 'white');
				}
				else{
					$('#comment'+pos).css('background-color', 'yellow');
					$('#comment'+pos).css('color', 'black');
				}

				$('#comment'+pos).empty().append(query.user.toUpperCase()+":"+res.review);
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
		pos = $(".matrix .slot1").offset();
		width = $(".matrix .slot1").width();
		width1 = $("#overlay1").width();
		height = $(".matrix .slot1").height();
		height2	= $('#comment1').height();
		leftPadding = parseInt($('.matrix .slot1').css('padding-left'));

		if (window.appData.settings.exif == 'exif-on'){
			$('.overlay').removeClass('hidden');
		}
		else{
			$('.overlay').addClass('hidden');
		}

		if (window.appData.settings.comment == 'off'){
			$('.comment').addClass('hidden');
		}
		else{
			$('.comment').removeClass('hidden');
		}

		$("h3#label1").offset({top: pos.top, left:pos.left+leftPadding});
		$("#overlay1").offset({top: pos.top, left:pos.left+width-width1+leftPadding});
		$('#comment1').offset({top: pos.top+height-height2, left:pos.left+leftPadding});
		$('#comment1').width(width);

		pos = $(".matrix .slot2").offset();
		width = $(".matrix .slot2").width();
		width1  = $("#overlay2").width();
		height = $(".matrix .slot2").height();
		height2	= $('#comment2').height();
		leftPadding = parseInt($('.matrix .slot2').css('padding-left'));		

		$("h3#label2").offset({top: pos.top, left:pos.left+leftPadding});
		$("#overlay2").offset({top: pos.top, left:pos.left+width-width1+leftPadding});
		$('#comment2').offset({top: pos.top+height-height2, left:pos.left+leftPadding});
		$('#comment2').width(width);


		pos = $(".matrix .slot3").offset();
		width = $(".matrix .slot3").width();
		width1  = $("#overlay3").width();
		height = $(".matrix .slot3").height();
		height2	= $('#comment3').height();	
		leftPadding = parseInt($('.matrix .slot3').css('padding-left'));

		$("h3#label3").offset({top: pos.top, left:pos.left+leftPadding});
		$("#overlay3").offset({top: pos.top, left:pos.left+width-width1+leftPadding});
		$('#comment3').offset({top: pos.top+height-height2, left:pos.left+leftPadding});
		$('#comment3').width(width);


		pos = $(".matrix .slot4").offset();
		width = $(".matrix .slot4").width();
		width1  = $("#overlay4").width();
		height = $(".matrix .slot4").height();
		height2	= $('#comment4').height();	
		leftPadding = parseInt($('.matrix .slot4').css('padding-left'));		

		$("h3#label4").offset({top: pos.top, left:pos.left+leftPadding});
		$("#overlay4").offset({top: pos.top, left:pos.left+width-width1+leftPadding});
		$('#comment4').offset({top: pos.top+height-height2, left:pos.left+leftPadding});
		$('#comment4').width(width);


		for(var i=1;i<=4; i++){
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

		for(var i=1;i<=4; i++){
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

function onModalLoaded(event) {
  var imageElt = $(event.relatedTarget);
  var pos = imageElt.attr("trigger-place");

  window.currModal = $(this);
  

  $(this).find('.modal-title-text').text('Tell us your thoughts about this picture(' + window.appData.projectInfo.products[pos-1]+')');

  var options = { 
       // target:        '#output',   // target element(s) to be updated with server response 
        beforeSubmit:  function(a,b,c){
        							a[a.length] = {name:"project", value:window.appData.projectInfo.curr};
        							a[a.length] = {name:"scene", value:window.appData.sceneInfo.total[window.appData.sceneInfo.curr].name};
        							a[a.length] = {name:"index", value:window.appData.sceneInfo.total[window.appData.sceneInfo.curr].number[window.appData.pageInfo.curr-1]};
        							a[a.length] = {name:"product", value:window.appData.projectInfo.products[pos-1]};
        							a[a.length] = {name:"user", value:window.appData.userInfo.name};
        							a[a.length] = {name:"email", value:window.appData.userInfo.email};
        							a[a.length] = {name:"imgsize", value:window.appData.settings.imgsize};
        							// console.log(a)
        							},  // pre-submit callback 

        complete:  		function(msg){window.currModal.modal("hide");
    								window.currModal = null;

    								if ((window.appData.settings.comment == 'my') || 
    									((window.appData.settings.comment == 'mml') && (window.appData.userInfo.name=='mml'))){
    									// console.log('reload comments');
    									load_comments();
    								}
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

function onReportModalLoaded(event){

	var reportSettings = window.appData.reportSettings;
	var href = $(this).find('a');

	$(this).find('#'+reportSettings.comment).addClass('active btn-primary');

	$(this).find('label').change(function(){
		$("label[filter='report-setting']").removeClass("btn-primary");
		$("label[filter='report-setting'].active").addClass("btn-primary");

		window.appData.reportSettings.comment = $('label.active:eq(0)').attr('id');
		localStorage.reportComment = window.appData.reportSettings.comment;
		console.log('update'+ window.appData.reportSettings.comment);

		if(window.appData.reportSettings.comment == 'my'){
			href.attr('href', '/report?project='+window.appData.projectInfo.curr+"&from="+window.appData.userInfo.name);
		}
		else {
			href.attr('href', '/report?project='+window.appData.projectInfo.curr+"&from="+window.appData.reportSettings.comment);
		}
	});

	if(window.appData.reportSettings.comment == 'my'){
		href.attr('href', '/report?project='+window.appData.projectInfo.curr+"&from="+window.appData.userInfo.name);
	}
	else {
		href.attr('href', '/report?project='+window.appData.projectInfo.curr+"&from="+window.appData.reportSettings.comment);
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

	// window.onresize = place_label;
	// window.onscroll = place_label;

	// $('#myModal1').on('show.bs.modal', onModalLoaded);
	// $('#myModal2').on('show.bs.modal', onModalLoaded);
	// $('#myModal3').on('show.bs.modal', onModalLoaded);
	// $('#myModal4').on('show.bs.modal', onModalLoaded);

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

