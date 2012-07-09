/* http://tempo-db.com/api/read-series/#read-series-by-key */

var tempodb = require('../tempodb');

var tdb = new tempodb.TempoDB({
	api_key: 'myagley',
	api_secret: 'opensesame'
});

var series_key = 'inthrma-test1';


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
