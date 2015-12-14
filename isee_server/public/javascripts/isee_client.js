

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

var PIC_NAMES = ["Idol4", "Idol4S", "Iphone-6S", "Samsung-S6"];

var model_data = {
	names:["Idol4", "Idol4S", "Iphone-6", "Samsung-S6"],
	user_name: "Jimmy Tang",
	comment:[
		{
			avail: true,
			grade: "issue",
			text: "The sharpness is poor.\nThe lens-distortion is obvious"
		},
		{
			avail: true,
			grade: "issue",
			text: "The sharpness is poor.\nThe lens-distortion is obvious.\nReddish picture"
		},
		{
			avail: true,
			grade: "good",
			text: "Picture is good"
		},
		{
			avail: true,
			grade: "good",
			text: "Good sharpness.\nObvious distortion"
		},
	]
}

function select_project(project) {
	window.appData.projectInfo.curr = project;
	load_scene();
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
			//FIXME: Only support 2 levels unfolding yet...
			select_scene('sunset');  //FIXME: Hard code now...

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
				'total': res.num,
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

	load_images(window.appData.projectInfo.curr, window.appData.scene, index);
}

function load_images(project, scene, index){
	load_image(project, scene, index, "idol4", 0, 1);
	load_image(project, scene, index, "idol4S", 0, 2);
	load_image(project, scene, index, "iphone", 0, 3);
	load_image(project, scene, index, "samsung", 0, 4);
}

function load_image(project, scene, index, product, size, pos) {
	var elt = document.getElementById("pic"+pos);

	var folder = window.appData.sceneInfo.currPath;
	var image_file = "/photos/"+project+"/"+folder+"/"+product+"_"+index+".jpg";
	elt.src=image_file;
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
  

  $(this).find('.modal-title-text').text('Tell us your thoughts about ' + PIC_NAMES[pos-1]);

  if (model_data.comment[pos-1].avail){
  	console.log("available");
  	if(model_data.comment[pos-1].grade == "good") {
  		console.log("good checked");
  		$(this).find('#img-good').checked ="checked";
  	}
  	else if(model_data.comment[pos-1].grade == "issue") {
  		console.log("issue chedked");
  		$(this).find('#img-bad').attr("checked","checked")
  	}
  	else if(model_data.comment[pos-1].grade == "terrible") {
  		console.log("poor checked");
  		$(this).find('#img-poor').checked ="checked";
  	}

  	console.log("re-paste");
  	console.log(model_data.comment[pos-1].text);
  	$(this).find("#comment-message").text(model_data.comment[pos-1].text);
  }

  var options = { 
       // target:        '#output',   // target element(s) to be updated with server response 
        beforeSubmit:  function(){console.log("before submit")},  // pre-submit callback 
        success:       function(){$('#myModal1').modal("hide");
        							$('#myModal2').modal("hide");
        							$('#myModal3').modal("hide");
        							$('#myModal4').modal("hide");},  // post-submit callback
        complete:  		function(){$('#myModal1').modal("hide");
        							$('#myModal2').modal("hide");
        							$('#myModal3').modal("hide");
        							$('#myModal4').modal("hide");},
        resetForm: true, 
        dataType:  'json' 
 
        // other available options: 
        //url:       url         // override for form's 'action' attribute 
        //type:      type        // 'get' or 'post', override for form's 'method' attribute 
        //dataType:  null        // 'xml', 'script', or 'json' (expected server response type) 
        //clearForm: true        // clear all form fields after successful submit 
        //resetForm: true        // reset the form after successful submit 
 
        // $.ajax options can be used here too, for example: 
        //timeout:   3000 
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

document.body.onload = select_project('idol4');

window.onresize = place_label
window.onscroll = place_label;

$('#myModal1').on('show.bs.modal', onModalLoaded);
$('#myModal2').on('show.bs.modal', onModalLoaded);
$('#myModal3').on('show.bs.modal', onModalLoaded);
$('#myModal4').on('show.bs.modal', onModalLoaded);