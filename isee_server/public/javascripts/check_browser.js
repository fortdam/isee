
console.log('checking browser...');

if (sessionStorage.declineBrowserInstall === undefined) {
	if(navigator.vendor.indexOf('Google') < 0){
	//User is using some other browser than Chrome
		var str = "The ISEE only works on Google Chrome, download it now?";
		var winChrome = "http://172.24.220.144/pub/software/Chrome_win.exe";
		var linuxChrome = "http://172.24.220.144/pub/software/google-chrome-stable_current_amd64.deb";

		if (navigator.platform.indexOf('Win') >= 0){
			if(confirm(str)){
				window.open(winChrome);
			}
			else{
				sessionStorage.declineBrowserInstall = true;
			}
		}
		else if(navigator.platform.indexOf('Linux') >= 0){
			if(confirm(str)){
				window.open(linuxChrome);
			}
			else{
				sessionStorage.declineBrowserInstall = true;
			}
		}
	}
}

