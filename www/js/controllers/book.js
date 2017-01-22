
app.controller('BookCtrl', function($scope, $ionicModal, $timeout, serviceService, $ionicHistory, $ionicLoading, $rootScope, $ionicPopup, customerService, $state, Pubnub) {

  $scope.datetimeValue = new Date();

  $scope.choice = {
    name: 'cash'
  };

  $scope.$on('$ionicView.beforeEnter', function(){
    if(!Parse.User.current()){
      $scope.customerProfile = {};
    }else{
      $scope.customerProfile = {};
      getCustomerProfile();
    }
  });

  $scope.artist = $rootScope.bookInfo.artistProfile;
  $scope.services = $rootScope.bookInfo.selectedService;
  $scope.totalBill = $rootScope.bookInfo.totalBill;

  $scope.book = function(datetimeValue) {
    if($scope.customerProfile.contactNumber){
      $scope.isBookingLoading = true;

      var Booking = Parse.Object.extend("Booking");
      var booking = new Booking();

      booking.set('artistInfo', $scope.artist);
      booking.set('selectedServices', $scope.services);
      booking.set('customerInfo', $scope.customerProfile);
      booking.set('paymentMode', $scope.choice.name);
      booking.set('totalBill', $scope.totalBill);
      booking.set('schedule', datetimeValue);
      booking.set('status', 'pending');

      booking.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          $scope.isBookingLoading = false;

          var alertPopup = $ionicPopup.alert({
            title: 'Booking Request Successful!',
            template: 'Your Artist will contact your mobile number ' + $scope.customerProfile.contactNumber + ' for confirmation in a while.'
          });

          alertPopup.then(function(res) {
            // $state.go('app.appointment', {}, {reload: true});
            if(!Parse.User.current()){
              var confirmPopup = $ionicPopup.confirm({
                title: 'Registration',
                template: 'While waiting for your artist, maybe you can register an account? It will only take a few seconds :)'
              });

              confirmPopup.then(function(res) {
                if(res) {
                  $scope.showRegisterForm();
                } else {

                }
              });
            }else{
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
              });
              $state.transitionTo('app.appointment', null, {reload: true, notify:true});
            }
          });
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          $scope.isBookingLoading = false;
          var alertPopup = $ionicPopup.alert({
            title: 'Booking Error',
            template: 'Sorry, There was something wrong with the booking process.'
          });

          alertPopup.then(function(res) {
            console.log('Thank you for not eating my delicious ice cream cone');
          });
        }
      });
    }else{
      var alertPopup = $ionicPopup.alert({
        title: 'Contact Number',
        template: 'A valid contact number is required, for the artist to contact you.'
      });

      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    }


  };

  function getCustomerProfile(){
    if(Parse.User.current()){
      customerService.getCustomerById(Parse.User.current().get('profileId'))
      .then(function(results) {
        // Handle the result
        $scope.customerProfile.id = results[0].id;
        $scope.customerProfile.firstName = results[0].get('firstName');
        $scope.customerProfile.lastName = results[0].get('lastName');
        $scope.customerProfile.email = results[0].get('email');
        $scope.customerProfile.birthDate = results[0].get('birthDate') || new Date();
        $scope.customerProfile.gender = results[0].get('gender') || 'female';
        $scope.customerProfile.address = results[0].get('address');
        $scope.customerProfile.contactNumber = results[0].get('contactNumber');
        $scope.customerProfile.avatar = results[0].get('avatar');

        return results;
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }
  }

});
