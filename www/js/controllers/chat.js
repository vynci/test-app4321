app.controller('ChatsCtrl', function($scope, $ionicHistory, $state, threadService, $ionicLoading) {

  var user = {};

	$scope.$on('$ionicView.enter', function(e) {
        if(Parse.User.current()){
            user.id = Parse.User.current().get('profileId');
            $scope.isLoading = true;
						getThreads();
        }else{
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
        }
	});

  $scope.unreadClass = 'blush-new-message';

  $scope.refresh = function(){
    getThreads();
    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.removeThread = function(thread){
    console.log(thread);

    thread.set("isCustomerThreadDeleted", true);

    thread.save(null, {
      success: function(result) {
        // Execute any logic that should take place after the object is saved.
        getThreads();
      },
      error: function(gameScore, error) {

      }
    });
  }

	function getThreads(){
		// $ionicLoading.show({
		// 	template: 'Loading :)'
		// }).then(function(){
		// 	console.log("The loading indicator is now displayed");
		// });

		threadService.getThreadById(Parse.User.current().get('profileId'))
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.threads = results;
			// $ionicLoading.hide();
      $scope.isLoading = false;
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}
})
