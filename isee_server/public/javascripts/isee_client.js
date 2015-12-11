

function load_images(){
	var test = "idol4";
	var scene = "sunset";
	var index = 1;

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

function load_exif(test, scene, index, product, cb) {

}

document.body.onload = load_images();