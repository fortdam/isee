var images = require("images");

function subsample_image(originalFile, targetFile, factor){
	var pic = images(originalFile);
	var width = pic.width()*factor;

	pic.size(width).save(targetFile);
}

subsample_image("D:/tmp/a.jpg", "D:/tmp/d.jpg", 0.125);