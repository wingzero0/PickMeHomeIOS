// model
;(function ($) {
	
	var app = this.app || (this.app = {});
	app.model = {};
	
	var emergencyCall = $('#emergencyCall');
	app.model.emergencyCall = emergencyCall;
	
	var InitPhoneNumber = function (){
		// get localStorge if it exists, return true for getting phone number successfully
		if (typeof localStorage['phoneNumber'] != 'undefined' && localStorage['phoneNumber'] != null && localStorage['phoneNumber'].length !=0 ){
			var phoneNumber = localStorage['phoneNumber'];
			emergencyCall.val(phoneNumber);
			return true;
		}else{
			return false;
		}
	}
	
	var SavePhoneNumber = function (){
		localStorage['phoneNumber'] = emergencyCall.val();
	}
	
	var IsFirstLaunch = function(){
		if (typeof localStorage['firstLaunch'] != 'undefined' && localStorage['firstLaunch'] != null && localStorage['firstLaunch'].length !=0 ){
			return false;
		}else{
			return true;
		}
	}

	var SetLaunched = function(){
		localStorage['firstLaunch'] = 100;
	}

	app.model.InitPhoneNumber = InitPhoneNumber;
	app.model.SavePhoneNumber = SavePhoneNumber;
	app.model.IsFirstLaunch = IsFirstLaunch;
	app.model.SetLaunched = SetLaunched;
}).call(this, jQuery);

// view, must be init after "app.model" is ready
;(function($){
	var app = this.app || (this.app = {});
	
	app.view = {};
	
	var DisplayInitButton = function(displayFlag){
		if (displayFlag == true){
			// set button for reminding user to add the phone number.
			$('#phoneInitButton').addClass('hidden');
			$('#phoneNumberContainer').removeClass('hidden');			
		}else{
			// set button for reminding user to add the phone number.
			$('#phoneInitButton').removeClass('hidden');
			$('#phoneNumberContainer').addClass('hidden');
		}
	}
	var UpdatePhoneLink = function(phoneNumber){
		var phoneLink = $('#callButton');
		phoneLink.attr('href', "tel:" + phoneNumber);
		phoneLink.html(phoneNumber);
		// phoneLink.html(app.view.callDescription + " : "+ phoneNumber);
	}

	var IsIOSFullScreen = function(){
		if ("standalone" in window.navigator) { // if define and set
			if (window.navigator.standalone){
				return true;
			}
		}else{
			return false;
		}
	}

	var welcomeSwipe = function(idSuffix){
		window.mySwipe = Swipe(document.getElementById('slider' + idSuffix), {
			speed: 1000,
			auto: 4000,
			continuous: false
		});
		$("#welcome" + idSuffix ).on("pagebeforehide", function(e){
			window.mySwipe.kill();
		});

		var closeWelcomeBtn = $('#close-welcome-btn' + idSuffix);

		closeWelcomeBtn.click(function(e){
			e.preventDefault();
			$.mobile.changePage('#main', {reverse: true});
		});
	}

	var InitView = function(){
		// show the welcome page
		// if ((typeof window.mySwipe != 'undefined') && window.mySwipe){
		// 	// kill web app cache. I don't know why it be there.
		// 	window.mySwipe.kill();
		// 	alert("kill at begin");
		// }else{
		// 	alert("no special");
		// }
		
		$(document).bind('pageshow', function(event, ui) {
			if ($(event.target).attr('id') === 'welcomeWeb') {
				// alert("show Web");
				welcomeSwipe("Web");
			}else if($(event.target).attr('id') === 'welcomeApp'){
				// alert("show App");
				welcomeSwipe("App")
			}
		});

		$.mobile.defaultPageTransition = 'slide';

		// app.view.callDescription = $('#callDes').text();

		// if it is web page from safari
		var readMe = $("#readMe");
		readMe.bind('click', function(e){
			e.preventDefault();
			// if (!IsIOSFullScreen()){
			// 	$.mobile.changePage('#welcomeWeb');
			// }else{
				$.mobile.changePage('#welcomeApp');
			// }
		});
		app.view.readMe = readMe;
	}
	app.view.UpdatePhoneLink = UpdatePhoneLink;
	app.view.DisplayInitButton = DisplayInitButton;
	app.view.InitView = InitView;
	app.view.IsIOSFullScreen = IsIOSFullScreen;
	app.view.welcomeSwipe = welcomeSwipe;
	// app.view.readMe = readMe;
}).call(this, jQuery);

// controller
;(function($){
	var InitGeneralEvent = function() {
		if (window.Touch) {
		  $('a:not(#callButton)').bind('touchstart', function(e) {
		    e.preventDefault();
		  });
		  $('a:not(#callButton)').bind('touchend', function(e) {
		    e.preventDefault();
		    return $(this).trigger('click');
		  });
		}
	}
	var UpdateManifest = function(){
		console.log("before check");
		if (window.navigator && window.navigator.onLine && window.applicationCache){
			console.log("start update");
			// window.applicationCache.update(); // bug, can't update in first time
			console.log("end update");
		}
		cache = window.applicationCache;
		cache.addEventListener('error', cacheErrorListener, false);

	    function cacheErrorListener(e) {
	        console.log(e);
	    }
	}
	var InitSetting = function(){
		// UpdateManifest();
		InitGeneralEvent();

		// init view display
		app.view.InitView();
		

		// if it is web page from safari
		if (!app.view.IsIOSFullScreen()){
			app.view.welcomeSwipe("Web");
		}else if (app.model.IsFirstLaunch() && app.view.IsIOSFullScreen()){
			app.model.SetLaunched();
			app.view.readMe.click();
			var retFlag = app.model.InitPhoneNumber();
			app.view.DisplayInitButton(retFlag);
			app.view.UpdatePhoneLink(app.model.emergencyCall.val());
		}else{
			$.mobile.changePage('#main');
			var retFlag = app.model.InitPhoneNumber();
			app.view.DisplayInitButton(retFlag);
			app.view.UpdatePhoneLink(app.model.emergencyCall.val());	
		}

		// bind event for user input
		var backButton = $('#backButton');
		var telInput = $('#emergencyCall');

		backButton.bind('click',function(e){
			e.preventDefault();
			$.mobile.changePage('#main', {reverse: true});
		});

		app.model.emergencyCall.keydown(function(e){
			var code = e.keyCode || e.which;
			if (code == 9 || code == 13){
				e.preventDefault();
				backButton.click();
				return;
			}
		});

		$("#setting").on("pagebeforehide", function(e){
			app.model.SavePhoneNumber();
			var displayFlag = false;
			if (app.model.emergencyCall.val().length != 0){
				displayFlag = true;
			}
			app.view.DisplayInitButton(displayFlag);
			app.view.UpdatePhoneLink(app.model.emergencyCall.val());
		});
	}

	// app is in window scope
	$(document).ready(InitSetting);
}).call(this, jQuery);


