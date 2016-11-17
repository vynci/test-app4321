
app.controller('HomeCtrl', function($scope, $ionicHistory, customerService, $ionicModal, $ionicLoading, $state, $rootScope, artistService, $cordovaGeolocation, $ionicPopup) {

	var map;
	var point;
	$scope.spiral = 'img/placeholder.png';

	$scope.$on('$ionicView.beforeEnter', function(){
		if(!Parse.User.current()){
			$scope.isLogged = false;
		}else{
			$scope.isLogged = true;
			getCustomerProfile();
		}
	});

	$ionicModal.fromTemplateUrl('templates/nearest-artist-modal.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.nearestArtistModal = modal;
	});

	function getCustomerProfile(){
		if($rootScope.currentUser){
			customerService.getCustomerById($rootScope.currentUser.get('profileId'))
			.then(function(results) {
				// Handle the result
				$scope.currentCustomer = results[0].get('firstName');
				$ionicLoading.hide();
			}, function(err) {
				// Error occurred
				console.log(err);
			}, function(percentComplete) {
				console.log(percentComplete);
			});
		}
		else{
			$ionicLoading.hide();
		}
	}

	$scope.redirect = function(state){
		console.log(state);
		if(state === 'quickbook'){
			state = '';
			// getCurrentLocation();
			$rootScope.quickBook();
		}else {
			$ionicHistory.nextViewOptions({
				disableAnimate: true,
				disableBack: true
			});

			$state.go(state);
		}
	}

	$rootScope.changeToMapView = function(){
		// if(map){
		// 	map.remove();
		// 	$state.go('app.service');
		// 	$scope.nearestArtistModal.hide();
		// }
		$state.go('app.service');
		$scope.nearestArtistModal.hide();
	}

	$scope.bookSelectedArtist = function(){
		$scope.nearestArtistModal.hide();
		$ionicHistory.nextViewOptions({
			disableAnimate: true
		});
		$state.go('app.artist', {artistId: $scope.profile.id});
	}

	$scope.closeModal = function() {
		if(map){
			map.remove();
			$scope.nearestArtistModal.hide();
		}
	};

	function generateRandomDistance(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getArtists(currentUserPosition, skip, nextPage){
		var loadingMsg = 'Finding the nearest artist nearby';

		$ionicLoading.show({
			template: loadingMsg
		}).then(function(){

		});

		artistService.getArtists(currentUserPosition, skip)
		.then(function(results) {
			$rootScope.nearbyArtists = []
			$rootScope.nearbyArtists.push(results[0]);

			$scope.profile = results[0];
			$scope.randomDistance = generateRandomDistance(300,500);
			$scope.nearestArtistModal.show();

			$ionicLoading.hide();
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}

	$rootScope.quickBook = function() {
		// point = new Parse.GeoPoint({latitude: 10.349792530358712, longitude: 123.90758514404297});
		// $rootScope.currentUserPosition = point;
		// getArtists(point);

		try {
			map = plugin.google.maps.Map.getMap(document.getElementById("map_canvas_home"));

			map.on(plugin.google.maps.event.MAP_READY, function() {
				map.getMyLocation({enableHighAccuracy: true }, function(location) {
					point = new Parse.GeoPoint({latitude: location.latLng.lat, longitude: location.latLng.lng});
					$rootScope.currentUserPosition = point;
					getArtists(point);

				}, function(err){
					var options = {timeout: 10000, enableHighAccuracy: false };
					$ionicLoading.show({
						template: 'Finding the nearest artist nearby'
					}).then(function(){
					});

					$cordovaGeolocation.getCurrentPosition(options).then(function(position){
						var point = new Parse.GeoPoint({latitude: position.coords.latitude, longitude: position.coords.longitude});
						$rootScope.currentUserPosition = point;
						getArtists(point);

					}, function(error){
						$ionicLoading.hide();
						$scope.isListEmpty = true;
						var alertPopup = $ionicPopup.alert({
							title: 'Find Location',
							template: "Sorry we couldn't get your current location. <br><br> Please turn on your <b>location service</b>, and try to restart the application. <br><br> Sorry for the inconvenience."
						});

						alertPopup.then(function(res) {

						});
					});
				});
			});
		}
		catch(err) {
			var alertPopup = $ionicPopup.alert({
				title: 'Find Location',
				template: "Sorry, This feature is not available in your device."
			});

			alertPopup.then(function(res) {

			});
		}
	}

	$scope.$on('$ionicView.beforeLeave', function(e) {
		console.log('leave');
		if(map){
			$rootScope.nearbyArtists = [];
			map.remove();
		}
	});


});
