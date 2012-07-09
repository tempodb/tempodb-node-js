/* http://tempo-db.com/api/read-series/#read-series-by-key */

var tempodb = require('../tempodb');

var tdb = new tempodb.TempoDB({
    api_key: 'your-api-key',
    api_secret: 'your-api-secret'
});

var series_key = 'your-custom-key';


// read a date range
var args = {
	series_key: series_key,
	start: new Date('2012-01-01'),
	end: new Date('2012-01-02'),
	interval: '1hour',
	'function': 'mean'
}

var start_time = new Date();
tdb.read(args, function(result){
	console.log(result);
	console.log(new Date() - start_time, 'ms');
});
