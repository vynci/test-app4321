
app.controller('ArtistListViewCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $rootScope, $ionicPopup, artistService, $state, $ionicHistory) {
  $scope.spiral = 'img/placeholder.png';
  $scope.position = {
    search : ''
  };
  $scope.filter = {
    hair : true,
    makeup : true,
    sort : ''
  }

  $scope.pageCount = 10;
  $scope.isListEmpty = false;
  $scope.isLoading = false;

  var map;
  var point;
  var geocoder = new google.maps.Geocoder();

  $scope.searchPlaceHolder = 'Find Artists By Entering Location...';
  $scope.loadingStatus = 'Finding Artists Near Your Location...';
  getCurrentLocation();

  $scope.$on('$ionicView.enter', function(e) {
    console.log('enter view');
  });

  $ionicModal.fromTemplateUrl('templates/filterModal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.filterModal = modal;
  });

  function getArtists(currentUserPosition, skip, nextPage){
    var loadingMsg = 'Finding Artists Near You :)';
    if(!nextPage){
      $scope.isLoading = true;
    }

    artistService.getArtists(currentUserPosition, skip)
    .then(function(results) {
      // Handle the result
      if(!nextPage){
        $scope.fromCloudActiveArtists = results;
        $rootScope.nearbyArtists = results;
      } else {
        var tmp = $scope.fromCloudActiveArtists;
        $scope.fromCloudActiveArtists = tmp.concat(results);
        $rootScope.nearbyArtists = $scope.fromCloudActiveArtists;
      }
      $scope.isListEmpty = false;
      $scope.isLoading = false;

      // $scope.position = {
      //   search : ''
      // };

      console.log($scope.position);

    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function reverseGeocoding(location) {
      var latlng = {
        lat: location.latitude,
        lng: location.longitude
      };
      geocoder.geocode({'location': latlng}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            console.log(results[1]);
            console.log($scope.position);
            $scope.position = {
              search : ''
            };
            // $scope.position.search.formatted_address = results[1].formatted_address;
            $scope.searchPlaceHolder = results[1].formatted_address;
            return results[1];
          } else {
            console.log(results[0]);
            return results[0];
          }
        } else {
          var error = {
            status: status,
            from: 'reverseGeocoding'
          };
        }
      });
  }

  function getCurrentLocation() {
    point = new Parse.GeoPoint({latitude: 10.349792530358712, longitude: 123.90758514404297});
    reverseGeocoding({latitude: 10.349792530358712, longitude: 123.90758514404297});
    getArtists(point);
    // if(plugin){
    //   map = plugin.google.maps.Map.getMap();
    //   map.on(plugin.google.maps.event.MAP_READY, function() {
    //     map.getMyLocation({enableHighAccuracy: true }, function(location) {
    //       point = new Parse.GeoPoint({latitude: location.latLng.lat, longitude: location.latLng.lng});
    //       $rootScope.currentUserPosition = point;
    //       getArtists(point);
    //     }, function(err){
    //       console.log('C');
    //       var options = {timeout: 10000, enableHighAccuracy: false };
    //       $ionicLoading.show({
    //         template: 'Finding Artists Near You :)'
    //       }).then(function(){
    //       });
    //
    //       $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    //         var point = new Parse.GeoPoint({latitude: position.coords.latitude, longitude: position.coords.longitude});
    //         $rootScope.currentUserPosition = point;
    //         getArtists(point);
    //
    //       }, function(error){
    //         $ionicLoading.hide();
    //         $scope.isListEmpty = true;
    //         var alertPopup = $ionicPopup.alert({
    //           title: 'Find Location',
    //           template: "Sorry we couldn't get your current location. <br><br> Please input your location in the search box above. <br><br> Sorry for the inconvenience."
    //         });
    //
    //         alertPopup.then(function(res) {
    //
    //         });
    //       });
    //     });
    //   });
    // } else {
    //   var alertPopup = $ionicPopup.alert({
    //     title: 'Find Location',
    //     template: "Sorry, This feature is not available in your device."
    //   });
    //
    //   alertPopup.then(function(res) {
    //     $state.go('app.home');
    //   });
    // }
  }

  $scope.findArtistsNearby = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: '<b>Find Artists</b>',
      template: 'Find Artitsts Near Your Location?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('You are sure');
        $scope.loadingStatus = 'Finding Artists Near Your Location...';
        getCurrentLocation();
      } else {
        console.log('You are not sure');
      }
    });
  };


  $scope.loadMoreArtists = function(){
    getArtists(point, $scope.pageCount, true);
    $scope.pageCount += 10;
  }

  $scope.changeToMapView = function(){
    $state.go('app.service');
  }

  // Triggered in the login modal to close it
  $scope.hideFilters = function() {
    $scope.filterModal.hide();
  };

  $scope.showFilters = function(isFilter, type){
    $scope.isFilter = isFilter;
    $scope.optionType = type;
    $scope.filterModal.show();
  }

  $scope.filterArtist = function(artist){
    // console.log(artist);
    var response;

    if($scope.filter.hair && !$scope.filter.makeup){
      response = artist.get('serviceType') === 'Hair Stylist';
    }
    else if(!$scope.filter.hair && $scope.filter.makeup){
      response = artist.get('serviceType') === 'Makeup Artist';
    }
    else if(!$scope.filter.hair && !$scope.filter.makeup){
      response = false;
    }
    else{
      response = artist.get('serviceType') === 'Hair Stylist' || artist.get('serviceType') === 'Makeup Artist';
    }

    return response;
  };

  $scope.parseAddress = function(address){
    var parsed = '';

    if(address){
      parsed = '(' + address + ')';
    }

    return parsed;
  }

  $scope.$watch('position.search', function(value, old) {
    console.log(value);

    if(value.geometry){
      var point = new Parse.GeoPoint({latitude: value.geometry.location.lat(), longitude: value.geometry.location.lng()});
      $rootScope.currentUserPosition = point;
      $scope.loadingStatus = 'Finding artists near ' + value.formatted_address;
      getArtists(point);
    }
  });

  $scope.$on('$ionicView.leave', function(e) {
    if(map){
      map.remove();
    }
  });

});
