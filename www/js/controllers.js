angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicLoading, $ionicPopup, $state, $rootScope, $ionicHistory, Pubnub, $pubnubChannel, customerService, $ionicSideMenuDelegate) {
  var user = {};
  $scope.profilePicTemp = "img/placeholder.png";
  $rootScope.side_menu = document.getElementsByTagName("ion-side-menu")[0];

  $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromParams, toParams) {
    if (toState.name != 'app.service') {
      $rootScope.side_menu.style.visibility = "visible";
    }
  });

  if(Parse.User.current()){
    $rootScope.currentUser = Parse.User.current();
    getCustomerProfile();
    pubnubInit();
  }else{
    $rootScope.currentUser = null;
  }

  console.log($rootScope.currentUser)

  $scope.loginData = {};

  // Create the login modal that we will use later
  $scope.registerData = {
    firstName : '',
    lastName : '',
    email : '',
    password : ''
  }

  $scope.spiral = "img/02.jpg"

  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.registerModal = modal;
  });

  $ionicModal.fromTemplateUrl('templates/my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modalConf = modal;
  });
  $scope.openModal = function() {
    $scope.modalConf.show();
  };
  $scope.closeModal = function() {
    $scope.modalConf.hide();
  };

  var userLogin = function(username, password){
    Parse.User.logIn(username, password, {
      success: function(user) {
        // Do stuff after successful login.
        $rootScope.currentUser = Parse.User.current();
        getCustomerProfile();

        $scope.closeModal();
        $ionicLoading.hide();
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        // $state.transitionTo($state.current, null, {reload: true, notify:true});
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: 'Login Error',
          template: 'Sorry ' + error.message
        });

        alertPopup.then(function(res) {
        });
      }
    });
  }

  $scope.viewProfile = function(){
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.account');
    $ionicSideMenuDelegate.toggleLeft();
  }

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.registerModal.hide();
    $scope.modalConf.hide();
    $scope.modal.show();
  };

  $scope.showRegisterForm = function(){
    $scope.modal.hide();
    $scope.modalConf.hide();
    $scope.registerModal.show();
  }

  $scope.closeModal = function(){
    $scope.modal.hide();
    $scope.registerModal.hide();
  }

  $scope.registerLater = function() {
    $scope.modalConf.hide();
    $state.go('app.book');
  };

  $scope.doLogin = function() {
    $ionicLoading.show({
      template: 'Logging in :)'
    }).then(function(){
      console.log("The loading indicator is now displayed");
    });
    userLogin($scope.loginData.username, $scope.loginData.password);
  };

  $scope.doLogout = function() {
    Parse.User.logOut().then(function(){
      $rootScope.currentUser = Parse.User.current();  // this will now be null
      $scope.currentCustomer = {};
      $scope.modal.show();
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.transitionTo('app.home', null, {reload: true, notify:true});
    });
  }

  $scope.doRegister =function(){
    $ionicLoading.show({
      template: 'Processing Your Registration :)'
    }).then(function(){
    });

    var Customer = Parse.Object.extend("Customer");
    var customer = new Customer();

    customer.set("firstName", $scope.registerData.firstName);
    customer.set("lastName", $scope.registerData.lastName);
    customer.set("email", $scope.registerData.email);

    customer.save(null, {
      success: function(result) {
        // Execute any logic that should take place after the object is saved.
        var user = new Parse.User();
        user.set("username", $scope.registerData.email);
        user.set("password", $scope.registerData.password);
        user.set("profileId", result.id);
        user.set("userType", 'customer');

        user.signUp(null, {
          success: function(user) {
            // Hooray! Let them use the app now.
            userLogin($scope.registerData.email, $scope.registerData.password);

          },
          error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            var alertPopup = $ionicPopup.alert({
              title: 'Signup Error',
              template: 'Sorry ' + error.message
            });

            alertPopup.then(function(res) {
            });
            $ionicLoading.hide();
          }
        });
      },
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        var alertPopup = $ionicPopup.alert({
          title: 'Signup Error',
          template: 'Sorry ' + error.message
        });

        alertPopup.then(function(res) {
        });
        $ionicLoading.hide();
      }
    });
  }

  $scope.showMessageAlert = function(message) {
    $scope.data = {};
    console.log(message);
    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<div style="padding: 0px 100px; text-align: center;"><img style="width:50%; border-radius: 50%";" src="' + message.sender.avatar + '"><br><b>' + message.sender.name + '</b></div>',
      title: '<b>You have a new message!</b> <br><br> <p style="text-align: justify;">' + message.content.message + '</p>',
      subTitle: '',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>View</b>',
          type: 'button-positive',
          onTap: function(e) {
            $state.go('app.chatView', {artistId: message.content.userId, chatId: message.content.threadId});
          }
        }
      ]
      });

      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });
  };

  $scope.showBookingAlert = function() {
    $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '<div style="padding: 0px 100px;"><img style="width:100%; border-radius: 50%";" src="img/portfolio/a.jpg"><br><div style="text-align:center;"><button class="button button-small button-blocked button-calm"><i class="icon ion-ios-email"> SMS</i></button>   <button class="button button-small button-balanced"><i class="icon ion-ios-telephone"> Call</i></button></div></div> <br>Name: Arya Stark <br>Location: Mandaue, Cebu City<br>Contact: +639272326087<br> Schedule: October 21, 2016 9:00 AM <br> Total Bill: P300',
      title: '<b>You have a new booking!</b>',
      subTitle: '',
      scope: $scope,
      buttons: [
    { text: 'Close' },
  {
    text: '<b>Chat</b>',
    type: 'button-energized',
    onTap: function(e) {
      $scope.showContactOption();
    }
  },
  {
    text: '<b>Accept</b>',
    type: 'button-balanced',
    onTap: function(e) {
      if (!$scope.data.wifi) {
        //don't allow the user to close unless he enters wifi password
        e.preventDefault();
      } else {
        return $scope.data.wifi;
      }
    }
  }
  ]
  });

  myPopup.then(function(res) {
    console.log('Tapped!', res);
  });

  };

  function getCustomerProfile(){
    if($rootScope.currentUser){
      customerService.getCustomerById(Parse.User.current().get('profileId'))
      .then(function(results) {
        // Handle the result
        $scope.currentCustomer = results[0];
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


  function pubnubInit(){

    $scope.bookingAlertChannel = 'book/' + Parse.User.current().get('profileId');
    $scope.messageAlertChannel = 'message/' + Parse.User.current().get('profileId');

    $scope.uuid = Parse.User.current().get('profileId');

    Pubnub.init({
      publish_key: 'pub-c-ffcdc13e-a8fe-4299-8a2d-eb5b41f0dc47',
      subscribe_key: 'sub-c-2d86535e-968a-11e6-94c7-02ee2ddab7fe',
      ssl: true,
      uuid: $scope.uuid
    });

    Pubnub.subscribe({
      channel: $scope.bookingAlertChannel,
      triggerEvents: ['callback'],
      connect : function() {
        // send a message
        console.log('hello');
      }
    });

    Pubnub.subscribe({
      channel: $scope.messageAlertChannel,
      triggerEvents: ['callback'],
      connect : function() {
        // send a message
        console.log('hello');

      }
    });

    $rootScope.$on(Pubnub.getMessageEventNameFor($scope.bookingAlertChannel), function(ngEvent, m) {
      console.log(m);
      $scope.showBookingAlert(m);
    });

    $rootScope.$on(Pubnub.getMessageEventNameFor($scope.messageAlertChannel), function(ngEvent, m) {
      console.log(m);
      console.log($state.current.name);
      if(m.content.threadId !== $state.params.chatId){
        $scope.showMessageAlert(m);
      }else{
        $rootScope.getStreamMessage(m);
      }
    });
  }

  // Listening to the callbacks


})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
