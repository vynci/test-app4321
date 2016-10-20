app.controller('ChatsCtrl', function($scope, $ionicHistory, $state, threadService, $ionicLoading) {

  var user = {};

	$scope.$on('$ionicView.enter', function(e) {
        if(Parse.User.current()){
            user.id = Parse.User.current().get('profileId');
						getThreads();
        }else{
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.transitionTo('tab.account-login', null, {reload: true, notify:true});
        }
	});

	function getThreads(){
		$ionicLoading.show({
			template: 'Loading :)'
		}).then(function(){
			console.log("The loading indicator is now displayed");
		});

		threadService.getThreadById(Parse.User.current().get('profileId'))
		.then(function(results) {
			// Handle the result
			console.log(results);
			$scope.threads = results;
			$ionicLoading.hide();
		}, function(err) {
			$ionicLoading.hide();
			// Error occurred
			console.log(err);
		}, function(percentComplete) {
			console.log(percentComplete);
		});
	}
})
