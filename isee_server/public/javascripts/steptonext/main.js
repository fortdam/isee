function write_cookie(){
	var account = $('#dl-account').text();
	var mail = $('#dl-mail').text();

	document.cookie = 'account='+account+';max-age='+100000000;
	document.cookie = 'mail='+mail+';max-age='+100000000;
}

write_cookie();
window.location.href = "/photos";