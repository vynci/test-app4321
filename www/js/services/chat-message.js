app.service('messageService', function($q) {

	var getMessageById = function(id) {
		var defer = $q.defer();
		var ServiceObject = Parse.Object.extend("Message");
		var query = new Parse.Query(ServiceObject);

		if(id){
			query.equalTo("threadId", id);
			query.descending("createdAt");
			query.limit(100);
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
		getMessageById: getMessageById
	};

});
