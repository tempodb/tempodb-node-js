/* http://tempo-db.com/api/read-series/#read-series-by-key */

var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-key', 'my-secret');

var series_key = 'my-series',
	series_start_date = new Date('2012-01-01'),
	series_end_date = new Date('2012-01-02');

// read a date range
var options = {
	interval: '1hour',
	'function': 'mean',
	limit: 1000
}
var count = 0

var start_time = new Date();
tempodb.read(series_key, series_start_date, series_end_date, options, function(err, result){
	if (err) {
		//console.log('Response code: ' + result.status);
		//console.log('Error reason: ' + result.json);
		console.log(err);
		console.log('Status code: ' + err.status);
		console.log('Error: ' + err.json);
	} else {
		//console.log('Response: ' + JSON.stringify(result.json));
		//console.log('Number of items in response: ' + result.json.data.length);
		result.json.data.map(function(err, dps) {
			if (err) { 
				//console.log('Error: ' + err);
				console.log('There was an error')
				//console.log(dps);
			} else {
				//for (var i=0; i<dps.length; i++) {
					//console.log('Datapoint: (t: ' + dps[i].t + ' v: ' + dps[i].v + ')');
				//}
				console.log('Total points: ' + dps.length);
			}
		});
		//console.log('Total datapoints: ' + count);
		//console.log('Completed in ', new Date() - start_time, 'ms\n');
	}
});
