var PIC_NAMES = ["Idol4", "Idol4S", "Iphone-6", "Samsung-S6"];

var page_info = {
	total: 28,
	start: 1,
	end: 5,
	curr: undefined,
	MAX_RANGE: 5
}

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

function update_page(index){
	console.log("update_page");
	if (index > page_info.total || index < 1 || index == page_info.curr){
		console.log("unused")
		return;
	}

	var numElt = Math.min(page_info.MAX_RANGE, page_info.total);
	var indexUpdated = false;

	page_info.curr = index;
	if (index < page_info.start){
		if ((index-numElt+1) >= 1){
			page_info.start = index - numElt + 1;
			page_info.end = index;
		}
		else {
			page_info.start = 1;
			page_info.end = numElt;
		}
		indexUpdated = true;
	}
	else if(index > page_info.end){
		if((index+numElt-1) <= page_info.total){
			page_info.start = index;
			page_info.end = index + numElt - 1;
		}
		else{
			page_info.end = page_info.total;
			page_info.start = page_info.total - numElt + 1;
		}
		indexUpdated = true;
	}

	if (indexUpdated) {
		console.log(page_info.start);
		for (var i=0; i<numElt; i++){
			$("a#page-index-"+(i+1)).attr("href", "javascript:update_page("+(i+page_info.start)+")");
			$("a#page-index-"+(i+1)).text(i+page_info.start);
		}		

		if (page_info.start > 1){
			$("a#page-prev-arrow").attr("href", "javascript:update_page("+(page_info.start-1)+")");
			$("li#page-prev").removeClass("disabled");
		}
		else {
			$("li#page-prev").addClass("disabled");
		}

		if (page_info.end < page_info.total){
			$("a#page-next-arrow").attr("href", "javascript:update_page("+(page_info.end+1)+")");
			$("li#page-next").removeClass("disabled");
		}
		else{
			$("li#page-next").addClass("disabled");
		}
	}

	var activeIndex = page_info.curr - page_info.start + 1;
	for (var i=1; i<numElt+1; i++){
		if (activeIndex == i){
			$("li#page-item-"+i).addClass("active");
		}
		else {
			$("li#page-item-"+i).removeClass("active");
		}
	}

	load_images(index);
}


function page_select(index){
	load_images(index);
}


function load_images(index){
	var test = "idol4";
	var scene = "sunset";

	load_image(test, scene, index, "idol4", 0, 1);
	load_image(test, scene, index, "idol4S", 0, 2);
	load_image(test, scene, index, "iphone", 0, 3);
	load_image(test, scene, index, "samsung", 0, 4);
}

function load_image(test, scene, index, product, size, pos) {
	var elt = document.getElementById("pic"+pos);
	var image_file = "/photos/"+test+"/"+scene+"/"+product+"_"+index+".jpg";
	elt.src=image_file;
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
}

document.body.onload = update_page(1);
window.onload = place_label;
window.onresize = place_label
window.onscroll = place_label;

$('#myModal1').on('show.bs.modal', onModalLoaded);
$('#myModal2').on('show.bs.modal', onModalLoaded);
$('#myModal3').on('show.bs.modal', onModalLoaded);
$('#myModal4').on('show.bs.modal', onModalLoaded);