app.service('portfolioService', function($q) {

	var getPortfolios = function(skip) {
		var defer = $q.defer();
		var PortfolioObject = Parse.Object.extend("Portfolio");
		var query = new Parse.Query(PortfolioObject);

		query.descending("updatedAt");

		if(skip){
			query.skip(skip);
		}

		query.limit(2);

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

	var getPortfolioById = function(id) {
		var defer = $q.defer();
		var PortfolioObject = Parse.Object.extend("Portfolio");
		var query = new Parse.Query(PortfolioObject);

		if(id){
			query.equalTo("ownerId", id);
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
		getPortfolios: getPortfolios,
		getPortfolioById : getPortfolioById
	};

});
