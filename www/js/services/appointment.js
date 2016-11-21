app.service('appointmentService', function($q) {

	var getBookings = function() {
		var defer = $q.defer();
		var AppointmentObject = Parse.Object.extend("Booking");
		var query = new Parse.Query(AppointmentObject);

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

	var getBookingsById = function(id, skip) {
		var defer = $q.defer();
		var AppointmentObject = Parse.Object.extend("Booking");
		var query = new Parse.Query(AppointmentObject);

		query.descending("updatedAt");

		if(id){
			query.equalTo("customerInfo.id", id);
		}

		if(skip){
			query.skip(skip);
		}

		query.limit(100);

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
		getBookings: getBookings,
		getBookingsById : getBookingsById
	};

});
