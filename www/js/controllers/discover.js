
app.controller('DiscoverCtrl', function($scope, $ionicModal, $ionicLoading, $ionicPopup, portfolioService, $state, commentService, customerService, artistService, $rootScope, $ionicScrollDelegate) {

  console.log('Discvoer List View!');
  $scope.spiral = 'img/placeholder.png';
  $scope.cardInfo = {};
  $scope.pageCount = 2;
  $scope.cards = [];
  $scope.comments = [];

  getPortfolios();

  // $ionicLoading.show({
  //   template: 'Loading...'
  // }).then(function(){
  //   console.log("The loading indicator is now displayed");
  // });

  $scope.isLoading = true;

  $ionicModal.fromTemplateUrl('templates/comment-modal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.commentModal = modal;
  });

  if(!Parse.User.current()){
    $scope.customerProfile = {};
  }else{
    $scope.customerProfile = {};
    // getCustomerProfile();
  }

  function getArtistById(portfolio){
    console.log(portfolio.get('artistInfo').id);
    artistService.getArtistById(portfolio.get('artistInfo').id)
    .then(function(results) {
      console.log(results[0]);
      portfolio.set('artistInfo',{
        id : results[0].id,
        avatar : results[0].get('avatar'),
        address : results[0].get('address'),
        name : results[0].get('firstName') + ' ' + results[0].get('lastName'),
      });
      $scope.cards.push(portfolio);
    }, function(err) {
      // Error occurred
    }, function(percentComplete) {

    });
  }

  function getCustomerById(comment){
    customerService.getCustomerById(comment.get('commenterInfo').id)
    .then(function(results) {
      console.log(results[0]);
      comment.set('commenterInfo',{
        id : results[0].id,
        avatar : results[0].get('avatar'),
        firstName : results[0].get('firstName'),
        lastName : results[0].get('lastName')
      });
      $scope.comments.push(comment);
    }, function(err) {
      // Error occurred
    }, function(percentComplete) {

    });
  }

  function getPortfolios(skip){
    portfolioService.getPortfolios(skip)
    .then(function(results) {
      // Handle the result
      $scope.numberOfResults = results.length;
      if(skip){
        console.log('skip');
        // var tmp = $scope.cards;
        // $scope.cards = tmp.concat(results);
        angular.forEach(results, function(portfolio) {
          getArtistById(portfolio);
        });
        $scope.$broadcast('scroll.infiniteScrollComplete');
      } else{
        console.log('not skip');
        angular.forEach(results, function(portfolio) {
          getArtistById(portfolio);
        });
        // $scope.cards = results;
      }
      $ionicLoading.hide();
      $scope.isLoading = false;
    }, function(err) {
      $ionicLoading.hide();
      $scope.isLoading = false;
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  function getCommentsById(id, ignoreLoad){

    $scope.comments = [];

    if(!ignoreLoad){
      $scope.isCommentLoading = true;
    }

    commentService.getCommentsById(id)
    .then(function(results) {
      // Handle the result
      console.log(results);

      angular.forEach(results, function(results) {
        getCustomerById(results);
      });

      $scope.isCommentLoading = false;

      // $scope.comments = results;
    }, function(err) {
      $scope.isCommentLoading = false;
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  }

  $scope.scrollMainToTop = function() {
    $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(true);
  };

  $scope.redirectToArtist = function(id){
    console.log(id);
    $state.go('app.artist', {artistId: id});
  }

  $scope.moreDataCanBeLoaded = function(){
    if($scope.numberOfResults !== 0){
      return true;
    }else{
      return false;
    }
  }

  $scope.refresh = function(){
    $scope.pageCount = 2;
    $scope.cards = [];
    getPortfolios();
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.addLike = function(card){
    if(Parse.User.current()){
      if(!arrayContains.call(card.attributes.likes, Parse.User.current().id)){
        card.add('likes', Parse.User.current().id);

        card.save(null,{
          success: function(result) {
            // save succeeded
          },
          error: function(testObject, error) {
            // inspect error
          }
        });
      } else {
        card.remove('likes', Parse.User.current().id);

        card.save(null,{
          success: function(result) {
            // save succeeded
            console.log(result);
          },
          error: function(testObject, error) {
            // inspect error
          }
        });
      }
    }else{
      var myPopup = $ionicPopup.show({
        template: 'A registered account is needed to like a post. Signup now, it is easy and quick! <br><br>If you already have an account, tap on the login button.',
        title: '<b>Discover Trends</b>',
        subTitle: '',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Login</b>',
            type: 'button-positive',
            onTap: function(e) {
              $scope.login();
            }
          },
          {
            text: '<b>Signup</b>',
            type: 'button-assertive',
            onTap: function(e) {
              $scope.showRegisterForm();
            }
          }
        ]
      });

      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });
    }

  }

  $scope.getComments = function(card){
    $scope.currentCard = card;
    $scope.cardInfo.portfolioId = card.id;
    getCommentsById(card.id);
    $scope.commentModal.show();
  }

  $scope.hideComments = function(){
    $scope.comments = [];
    $scope.commentModal.hide();
  }

  $scope.postComment = function(id){

    if(Parse.User.current()){
      var Comment = Parse.Object.extend("Comment");
      var comment = new Comment();

      comment.set('portfolioId', $scope.cardInfo.portfolioId);
      comment.set('commenterInfo', $rootScope.customerProfile);
      comment.set('comment', $scope.cardInfo.comment);

      $scope.cardInfo.comment = '';

      comment.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          console.log(result);
          $scope.comments.push(result)
          // getCommentsById($scope.cardInfo.portfolioId, true);
          $scope.cardInfo.comment = '';

          $scope.currentCard.add('comments', result.id);

          $scope.currentCard.save(null,{
            success: function(result) {
              // save succeeded
              $ionicLoading.hide();
            },
            error: function(testObject, error) {
              // inspect error
              $ionicLoading.hide();
            }
          });


        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
          getCommentsById($scope.cardInfo.portfolioId);
          $ionicLoading.hide();
        }
      });
    }else{
      var myPopup = $ionicPopup.show({
        template: 'A registered account is needed to comment on a post. Signup now, it is easy and quick! <br><br>If you already have an account, tap on the login button.',
        title: '<b>Discover Trends</b>',
        subTitle: '',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Login</b>',
            type: 'button-positive',
            onTap: function(e) {
              $scope.login();
            }
          },
          {
            text: '<b>Signup</b>',
            type: 'button-assertive',
            onTap: function(e) {
              $scope.showRegisterForm();
            }
          }
        ]
      });

      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });
    }

  }

  $scope.loadMorePosts = function(){
    console.log('infinite');
    getPortfolios($scope.pageCount);
    $scope.pageCount += 2;
  }

  function arrayContains(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(needle) {
        var i = -1, index = -1;

        for(i = 0; i < this.length; i++) {
          var item = this[i];

          if((findNaN && item !== item) || item === needle) {
            index = i;
            break;
          }
        }

        return index;
      };
    }

    return indexOf.call(this, needle) > -1;
  };

  function getCustomerProfile(){
    // $ionicLoading.show({
    //   template: 'Loading...'
    // }).then(function(){
    //   console.log("The loading indicator is now displayed");
    // });

    if(Parse.User.current()){
      customerService.getCustomerById(Parse.User.current().get('profileId'))
      .then(function(results) {
        // Handle the result
        $scope.customerProfile.id = results[0].id;
        $scope.customerProfile.firstName = results[0].get('firstName');
        $scope.customerProfile.lastName = results[0].get('lastName');
        $scope.customerProfile.avatar = results[0].get('avatar');

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


});
