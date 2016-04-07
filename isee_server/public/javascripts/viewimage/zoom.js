


function move_pic_callback(index, dx, dy){
	if (index == 0){
		for(var i=1; i<=getPicNum(); i++){
			move_picture(i, dx, dy);
		}
	}
	else {
		move_picture(index, dx, dy);
	}
}

function move_picture(index, dx, dy){

	var holder = $('.matrix #img-holder'+index);
	var holderWidth = holder.width();
	var holderHeight = $('.matrix .slot'+index).height();  //Fuck! use the height for slot, since inner div sshare the same height as pic
	var holderOffset = holder.offset();

	var img = $('.matrix img#pic'+index);
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

	$('.matrix img#pic'+index).offset(imgOffset);
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

	var totalPic = getPicNum();

	window.appData.zoomOriginSize = {};

	for (var i=1; i<=totalPic; i++){
		var width = $('.matrix .slot'+i).width();
		var height = $('.matrix .slot'+i).height();

		window.appData.zoomOriginSize['width'+i] = width;
		window.appData.zoomOriginSize['height'+i] = height;
	}
}

function getLayout(){
	return window.appData.settings.layout;
}

function getPicNum(){
	return window.appData.projectInfo.prefix.length;
}

function set_zoom(zoom_level){
	var width;
	var height;

	var ratio;

	var totalPic = getPicNum();

	ratio = parseInt(zoom_level*100).toString() + '%';

	$('.img-holder').css('overflow', 'hidden');

	for(var i=1; i<=totalPic; i++){
		$('.matrix .slot'+i).width(window.appData.zoomOriginSize['width'+i]);
		$('.matrix .slot'+i).height(window.appData.zoomOriginSize['height'+i]);
		$('.matrix .slot'+i).css('overflow', 'hidden');
		$('.matrix img#pic'+i).css('width', ratio); 
		$('.matrix img#pic'+i).css('max-width', ratio); 
	}

	if(zoom_level == 1){
		for(var i=1; i<=totalPic; i++){
			dragable.detachElement(document.getElementById('pic'+i));
		}
	}
	else {
		for(var i=1; i<=totalPic; i++){
			dragable.attachElement(document.getElementById('pic'+i), move_pic_callback);
		}
	}

	for(var i=1; i<=totalPic; i++){
		move_pic_callback(i, 0, 0);
	}
}

$('#zoom-slider').bind('change', function(e){
	if (need_record_size_for_zoom()){
		record_size_for_zoom();
	}
	set_zoom(e.target.value/100);
})