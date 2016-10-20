app.service('threadService', function($q) {

	var getThreadById = function(id) {
		var defer = $q.defer();
		var ServiceObject = Parse.Object.extend("Thread");
		var query = new Parse.Query(ServiceObject);

		if(id){
			query.equalTo("customerInfo.id", id);
		}

		query.find({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
			}
		});
		return defer.promise;
	};

	var isThreadExist = function(customerId, artistId) {
		var defer = $q.defer();
		var ServiceObject = Parse.Object.extend("Thread");
		var query = new Parse.Query(ServiceObject);

		if(customerId && artistId){
			query.equalTo("customerInfo.id", customerId);
			query.equalTo("artistInfo.id", artistId);
		}

		query.find({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
			}
		});
		return defer.promise;
	};


	return {
		getThreadById: getThreadById,
		isThreadExist : isThreadExist
	};

});
