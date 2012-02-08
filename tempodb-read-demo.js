var tempodb = require('./tempodb');

var tdb = new tempodb.TempoDB({
	api_key: 'your-api-key',
	api_secret: 'your-api-secret'
});

var series_key = 'custom-series-key';


// read a date range
var args = {
	series_key: series_key,
	start: new Date('2012-01-01'),
	end: new Date('2012-01-02'),
	interval: '1hour',
	'function': 'min'
}

var tick = new Date();
tdb.read(args, function(result){
	var tock = new Date();
	console.log(result);
	console.log('done in', tock - tick, 'ms');
});
