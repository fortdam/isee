function write_cookie(){
	var account = $('#dl-account').text();
	var mail = $('#dl-mail').text();

	document.cookie = 'account='+account+';max-age='+100000000;
	document.cookie = 'mail='+mail+';max-age='+100000000;
}

var error = $('#dl-error').text();

if (error && error.length > 0){
	alert("Authentication Fail");
	window.location.href="/login";
}
else {
    write_cookie();
    window.location.href = "/photos";	
}
