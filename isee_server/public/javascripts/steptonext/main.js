function write_cookie(){
	var account = $('#dl-account').text();
	var mail = $('#dl-mail').text();

	document.cookie = 'account='+account+';max-age='+100000000+";path=/";
	document.cookie = 'mail='+mail+';max-age='+100000000+";path=/";
}

var error = $('#dl-error').text();

if (error && error.length > 0){
	alert("Authentication Fail");
	window.location.href="/login";
}
else {
    write_cookie();

    if(sessionStorage.url && sessionStorage.url.length>0){
    	var url = sessionStorage.url;
    	sessionStorage.url = "";
    	window.location.href = "/steptonext?url="+url;
    }
    else {
    	window.location.href = "/photos";	    	
    }
}
