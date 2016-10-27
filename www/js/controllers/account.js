
app.controller('AccountCtrl', function($scope, $ionicModal, $timeout, customerService, $ionicLoading, $rootScope, $ionicPopup, $cordovaCamera) {

  $scope.placeholder = 'img/placeholder.png';

  $scope.$on('$ionicView.enter', function() {
    $scope.customerProfile = {};
    getCustomerProfile();
  });

  function getCustomerProfile(){
    $ionicLoading.show({
      template: 'Loading :)'
    }).then(function(){
      console.log("The loading indicator is now displayed");
    });

    if($rootScope.currentUser){
      customerService.getCustomerById($rootScope.currentUser.get('profileId'))
      .then(function(results) {
        // Handle the result
        console.log(results);
        $scope.currentCustomerProfile = results[0];

        $scope.customerProfile.firstName = results[0].get('firstName');
        $scope.customerProfile.avatar = results[0].get('avatar');
        $scope.customerProfile.lastName = results[0].get('lastName');
        $scope.customerProfile.email = results[0].get('email');
        $scope.customerProfile.birthDate = results[0].get('birthDate') || new Date();
        $scope.customerProfile.gender = results[0].get('gender') || 'female';
        $scope.customerProfile.address = results[0].get('address');
        $scope.customerProfile.contactNumber = results[0].get('contactNumber');

        $scope.customerProfile.oldPassword = 'helloworld';
        $scope.customerProfile.newPassword = 'helloworld';

        $ionicLoading.hide();

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

  document.addEventListener("deviceready", function () {
    var options = {
      quality: 100,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 200,
      targetHeight: 200,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false,
      correctOrientation:true,
      cameraDirection : 0
    };

    $scope.takePicture = function(){
      options.sourceType = Camera.PictureSourceType.CAMERA;
      $cordovaCamera.getPicture(options).then(function(imageData) {
        var file = imageData;
        var uploadFile = new Parse.File('image.jpg', {base64 : file});

        uploadFile.save().then(function(result) {
          // The file has been saved to Parse.
          console.log(result);
          updateAvatar(result._url);
        }, function(error) {
          // The file either could not be read, or could not be saved to Parse.
        });

      }, function(err) {
        // error
      });
    }

    $scope.getFromGallery = function(){
      options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
      $cordovaCamera.getPicture(options).then(function(imageData) {
        var file = imageData;
        var uploadFile = new Parse.File('image.jpg', {base64 : file});

        uploadFile.save().then(function(result) {
          // The file has been saved to Parse.
          console.log(result);
          updateAvatar(result._url);
        }, function(error) {
          // The file either could not be read, or could not be saved to Parse.
        });

      }, function(err) {
        // error
      });
    }
  }, false);


  $scope.showUploadOption = function() {
    $scope.data = {};

    // An elaborate, custom popup
    var myPopup = $ionicPopup.show({
      template: '',
      title: '<b>Choose</b>',
      subTitle: '',
      scope: $scope,
      buttons: [
        { text: 'Close' },
        {
          text: '<b>Camera</b>',
          type: 'button-energized',
          onTap: function(e) {
            $scope.takePicture();
          }
        },
        {
          text: '<b>Gallery</b>',
          type: 'button-balanced',
          onTap: function(e) {
            $scope.getFromGallery();
          }
        }
      ]
    });

    myPopup.then(function(res) {
      console.log('Tapped!', res);
    });

  };

  function updateAvatar(url){
    $ionicLoading.show({
      template: 'Loading...'
    }).then(function(){

    });

    $scope.currentCustomerProfile.set("avatar", url);

    $scope.currentCustomerProfile.save(null, {
      success: function(result) {
        // Execute any logic that should take place after the object is saved.
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
          title: 'Profile Picture Update',
          template: 'Your profile picture has been successfully updated.'
        });

        alertPopup.then(function(res) {
          getCustomerProfile();
        });

      },
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        $ionicLoading.hide();
        console.log(error);
      }
    });
  }


  $scope.updateProfile = function(){
    $scope.currentCustomerProfile.set("firstName", $scope.customerProfile.firstName);
    $scope.currentCustomerProfile.set("lastName", $scope.customerProfile.lastName);
    $scope.currentCustomerProfile.set("email", $scope.customerProfile.email);
    $scope.currentCustomerProfile.set("gender", $scope.customerProfile.gender);
    $scope.currentCustomerProfile.set("contactNumber", $scope.customerProfile.contactNumber);
    $scope.currentCustomerProfile.set("address", $scope.customerProfile.address);
    console.log($scope.customerProfile.birthDate);
    $scope.currentCustomerProfile.set("birthDate",$scope.customerProfile.birthDate);

    console.log($scope.currentCustomerProfile.attributes);

    $scope.currentCustomerProfile.save(null, {
      success: function(result) {
        // Execute any logic that should take place after the object is saved.
        var alertPopup = $ionicPopup.alert({
          title: 'Account Update',
          template: 'Your account profile has been successfully updated.'
        });

        alertPopup.then(function(res) {
          console.log('Thank you for not eating my delicious ice cream cone');
        });

      },
      error: function(gameScore, error) {
        // Execute any logic that should take place if the save fails.
        // error is a Parse.Error with an error code and message.
        console.log(error);
      }
    });
  }

});
