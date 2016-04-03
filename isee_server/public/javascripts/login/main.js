
var link = location.search;

if (link.indexOf('?url=') == 0){
	//There is url param in the area
	sessionStorage.url = link.slice(5);
}
else {
	sessionStorage.url = "";
}