

var dragable = {
	'startX': -1,
	'startY': -1,
	'currIndex': null,
	'callback': null
};

dragable._mouseDownHandler = function(e){
	dragable.startX = -1;
	dragable.startY = -1;
	console.log(e);
}


dragable._drag = function(e){
	if (dragable.startY === -1){
		dragable.startX = e.x;
		dragable.startY = e.y;
	}
	else if(e.x==0 && e.y==0){
		//Bypass the last event
	}
	else if (dragable.callback && typeof(dragable.callback) == 'function'){

		if (e.ctrlKey){
			var result = e.srcElement.id.match(/pic(\d)/);
			dragable.callback(parseInt(result[1]), e.x-dragable.startX, e.y-dragable.startY);
		}
		else {
			dragable.callback(0, e.x-dragable.startX, e.y-dragable.startY);
		}

		dragable.startX = e.x;
		dragable.startY = e.y;
	}
}


dragable.attachElement = function(node, cb){
	this.callback = cb;
	node.addEventListener('mousedown', dragable._mouseDownHandler, false);
	node.addEventListener('drag', dragable._drag, false);
}

dragable.detachElement = function(node){
	node.removeEventListener('mousedown', dragable._mouseDownHandler, false);
	node.removeEventListener('drag', dragable._drag, false);
}


 