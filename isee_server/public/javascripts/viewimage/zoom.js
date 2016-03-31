


function move_pic_callback(index, dx, dy){
	if (index == 0){
		move_picture(1, dx, dy);
		move_picture(2, dx, dy);
		move_picture(3, dx, dy);
		move_picture(4, dx, dy);
	}
	else {
		move_picture(index, dx, dy);
	}
}

function move_picture(index, dx, dy){

	var holder = $('#img-holder'+index);
	var holderWidth = holder.width();
	var holderHeight = $('.matrix .slot'+index).height();  //Fuck! use the height for slot, since inner div sshare the same height as pic
	var holderOffset = holder.offset();

	var img = $('img#pic'+index);
	var imgWidth = img.width();
	var imgHeight = img.height();
	var imgOffset = img.offset()

	if(imgOffset.top+dy > holderOffset.top){
		dy = holderOffset.top - imgOffset.top;
	}
	else if(holderOffset.top+holderHeight > imgOffset.top+imgHeight+dy){
		dy = (holderOffset.top+holderHeight) - (imgOffset.top+imgHeight);
	}

	if(imgOffset.left+dx > holderOffset.left){
		dx = holderOffset.left - imgOffset.left;
	}
	else if(holderOffset.left+holderWidth > imgOffset.left+imgWidth+dx){
		dx = (holderOffset.left+holderWidth) -(imgOffset.left+imgWidth);
	}

	imgOffset.left += dx;
	imgOffset.top += dy;

	$('img#pic'+index).offset(imgOffset);
}

function need_record_size_for_zoom(){
	if (window.appData.zoomOriginSize === undefined){
		return true;
	}
	else {
		return false;
	}
}

function record_size_for_zoom(){
	var width;
	var height;

	window.appData.zoomOriginSize = {};

	width = $('.matrix .slot1').width();
	height = $('.matrix .slot1').height();

	window.appData.zoomOriginSize.width1 = width;
	window.appData.zoomOriginSize.height1 = height;

	width = $('.matrix .slot2').width();
	height = $('.matrix .slot2').height();

	window.appData.zoomOriginSize.width2 = width;
	window.appData.zoomOriginSize.height2 = height;

	width = $('.matrix .slot3').width();
	height = $('.matrix .slot3').height();

	window.appData.zoomOriginSize.width3 = width;
	window.appData.zoomOriginSize.height3 = height;

	width = $('.matrix .slot4').width();
	height = $('.matrix .slot4').height();

	window.appData.zoomOriginSize.width4 = width;
	window.appData.zoomOriginSize.height4 = height;
}

function set_zoom(zoom_level){
	var width;
	var height;

	var ratio;

	ratio = parseInt(zoom_level*100).toString() + '%';

	$('.img-holder').css('overflow', 'hidden');

	$('.matrix .slot1').width(window.appData.zoomOriginSize.width1);
	$('.matrix .slot1').height(window.appData.zoomOriginSize.height1);
	$('.matrix .slot1').css('overflow', 'hidden');
	$('.matrix img#pic1').css('width', ratio); 
	$('.matrix img#pic1').css('max-width', ratio); 


	$('.matrix .slot2').width(window.appData.zoomOriginSize.width2);
	$('.matrix .slot2').height(window.appData.zoomOriginSize.height2);
	$('.matrix .slot2').css('overflow', 'hidden');
	$('.matrix img#pic2').css('width', ratio); 
	$('.matrix img#pic2').css('max-width', ratio);


	$('.matrix .slot3').width(window.appData.zoomOriginSize.width3);
	$('.matrix .slot3').height(window.appData.zoomOriginSize.height3);
	$('.matrix .slot3').css('overflow', 'hidden');
	$('.matrix img#pic3').css('width', ratio); 
	$('.matrix img#pic3').css('max-width', ratio);


	$('.matrix .slot4').width(window.appData.zoomOriginSize.width4);
	$('.matrix .slot4').height(window.appData.zoomOriginSize.height4);
	$('.matrix .slot4').css('overflow', 'hidden');
	$('.matrix img#pic4').css('width', ratio); 
	$('.matrix img#pic4').css('max-width', ratio);	

	if(zoom_level == 1){
		dragable.detachElement(document.getElementById('pic1'));
		dragable.detachElement(document.getElementById('pic2'));
		dragable.detachElement(document.getElementById('pic3'));
		dragable.detachElement(document.getElementById('pic4'));
	}
	else {
		dragable.attachElement(document.getElementById('pic1'), move_pic_callback);
		dragable.attachElement(document.getElementById('pic2'), move_pic_callback);
		dragable.attachElement(document.getElementById('pic3'), move_pic_callback);
		dragable.attachElement(document.getElementById('pic4'), move_pic_callback);
	}

	move_picture(1, 0, 0);
	move_picture(2, 0, 0);
	move_picture(3, 0, 0);
	move_picture(4, 0, 0); 
}

$('#zoom-slider').bind('change', function(e){
	if (need_record_size_for_zoom()){
		record_size_for_zoom();
	}
	set_zoom(e.target.value/100);
})