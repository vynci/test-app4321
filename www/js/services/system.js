app.service('systemService', function($q) {

	var getSystem = function() {
		var defer = $q.defer();
		var SystemObject = Parse.Object.extend("System");
		var query = new Parse.Query(SystemObject);

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
		getSystem: getSystem
	};

});
