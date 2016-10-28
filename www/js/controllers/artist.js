
app.controller('ArtistCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $stateParams, artistService, $state, $rootScope, $ionicModal, serviceService, portfolioService, reviewService, $ionicPopup, threadService, customerService) {

  console.log($stateParams);

  $ionicLoading.show({
    template: 'Loading...'
  }).then(function(){
    console.log("The loading indicator is now displayed");
  });

  $scope.tabStatus = {
    services : '',
    portfolio : '',
    reviews : ''
  };

  $scope.spiral = 'img/placeholder.png';

  $scope.selectedTab = 'services';

  $scope.images = [];
  $scope.selectedService = [];

  $scope.totalBill = 0;
  $scope.artistId = $stateParams.artistId;
  getArtistById($stateParams.artistId);

  function getArtistById(id){
    artistService.getArtistById(id)
    .then(function(results) {
      // Handle the result
      $scope.profile = results[0].attributes;

      getServiceById(results[0].id);

      return results;
    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function getServiceById(id){
    serviceService.getServiceById(id)
    .then(function(results) {
      // Handle the result
      $scope.artistServices = results;
      $ionicLoading.hide();
      return results;
    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function getPortfolioById(id){
    portfolioService.getPortfolioById(id)
    .then(function(results) {
      // Handle the result
      console.log(results);
      $scope.artistPortfolio = results;
    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function getReviewsById(id){
    $ionicLoading.show({
      template: 'Loading...'
    }).then(function(){
      console.log("The loading indicator is now displayed");
    });
    reviewService.getReviewsById(id)
    .then(function(results) {
      // Handle the result
      console.log(results);
      $scope.artistReviews = results;
      $ionicLoading.hide();
    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function createNewThread(customer){
    var Thread = Parse.Object.extend("Thread");
    var thread = new Thread();

    thread.set("lastMessage", '');
    thread.set("messages", []);
    thread.set("artistInfo", {
      "id": $stateParams.artistId,
      "firstName": $scope.profile.firstName,
      "lastName": $scope.profile.lastName,
      "avatar": $scope.profile.avatar
    });

    thread.set("customerInfo", {
      "id": Parse.User.current().get('profileId'),
      "firstName": customer.get('firstName'),
      "lastName": customer.get('lastName'),
      "avatar": customer.get('avatar') || 'img/portfolio/c.jpg'
    });

    thread.save(null, {
      success: function(result) {
        // Execute any logic that should take place after the object is saved.
        console.log('last message success');
        $state.go('app.chatView', {artistId: $scope.artistId, chatId: result.id});
        $ionicLoading.hide();
      },
      error: function(gameScore, error) {
        $ionicLoading.hide();
      }
    });
  }

  function getCustomerProfile(){
    $ionicLoading.show({
      template: 'Loading :)'
    }).then(function(){
    });

    if(Parse.User.current()){
      customerService.getCustomerById(Parse.User.current().get('profileId'))
      .then(function(results) {
        // Handle the result
        createNewThread(results[0]);


        return results;
      }, function(err) {
        // Error occurred
        $ionicLoading.hide();
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }
  }


  function removeArray(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
      what = a[--L];
      while ((ax= arr.indexOf(what)) !== -1) {
        arr.splice(ax, 1);
      }
    }
    return arr;
  }

  function loadImages() {
    for(var i = 0; i < 10; i++) {
      $scope.images.push({id: i, src: "http://placehold.it/200x200"});
    }
  }

  $scope.messageArtist = function(){
    threadService.isThreadExist(Parse.User.current().get('profileId'), $scope.artistId)
    .then(function(results) {
      // Handle the result
      console.log(results);
      if(results.length){
        $state.go('app.chatView', {artistId: $scope.artistId, chatId: results[0].id});
      }else{
        console.log('create new thread');
        getCustomerProfile();
      }

      return results;
    }, function(err) {
      $ionicLoading.hide();
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  $scope.viewPortfolio = function(path, description){

    if(!description){
      description = '';
    }

    var myPopup = $ionicPopup.show({
      template: '<div style=""><img style="width:100%;" src="' + path +'"></div><br><p>' + description + '</p>',
      title: '<b>View Portfolio</b>',
      subTitle: '',
      scope: $scope,
      buttons: [
        { text: 'Close' },
      ]
    });

    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });
  }

  $scope.followArtist = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Follow Artist',
      template: 'Your are now following this artist. <br><br>You will get updates such as promos, new services, and other fun stuff such as freebies! :)'
    });

    alertPopup.then(function(res) {
      console.log('Thank you for not eating my delicious ice cream cone');
    });
  }

  $scope.toggleSelection = function(service){
    if(!service.checked || service.checked === undefined){
      service.checked = true;
      $scope.selectedService.push(service.id);
      $scope.totalBill = $scope.totalBill + service.attributes.price;
    } else {
      service.checked = false;
      removeArray($scope.selectedService, service.id);
      $scope.totalBill = $scope.totalBill - service.attributes.price;
    }
  }

  $scope.changeTab = function(tab) {
    $scope.selectedTab = tab;

    if(tab === 'portfolio' && !$scope.artistPortfolio){
      getPortfolioById($stateParams.artistId);
    }else if(tab === 'reviews'){
      getReviewsById($stateParams.artistId)
    }
  }

  $scope.book = function(){
    console.log($scope.selectedService);


    $rootScope.bookInfo = {
      totalBill : $scope.totalBill,
      artistProfile : {
        id : $stateParams.artistId,
        firstName : $scope.profile.firstName,
        lastName : $scope.profile.lastName,
        avatar : $scope.profile.avatar,
        contactNumber : $scope.profile.contactNumber,
        email : $scope.profile.email
      },
      selectedService : $scope.selectedService
    };
    if(Parse.User.current()){
      $state.go('app.book');
    }else{
      $scope.modalConf.show();
    }

  }


});
