/* http://tempo-db.com/api/read-series/#read-series-by-key */

var TempoDBClient = require('tempodb').TempoDBClient;
var tempodb = new TempoDBClient('your-api-key', 'your-api-secret')

var series_key = 'your-custom-key',
	series_start_date = new Date('2012-01-01'),
	series_end_date = new Date('2012-01-02');

// read a date range
var options = {
	keys: series_key,
	interval: '1hour',
	'function': 'mean'
}

var start_time = new Date();
tempodb.read(series_start_date, series_end_date, options, function(result){
	console.log(result.response + ': ' + JSON.stringify(result.body));
	console.log('Completed in', new Date() - start_time, 'ms\n');
});
