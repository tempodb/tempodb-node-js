/* http://tempo-db.com/api/read-series/#read-series-by-key */

var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-database-id', 'my-key', 'my-secret');

var series_start_date = new Date('2012-01-01'),
    series_end_date = new Date('2012-01-02');

// read a date range
var options = {
	'rollup.fold': 'max',
  'rollup.period': '10min',
	key: [ 'foo', 'bar']
}
var count = 0

var start_time = new Date();
tempodb.readMulti(series_start_date, series_end_date, options, function(err, result){
<<<<<<< HEAD
	if (err) {
		console.log(err);
		console.log('Status code: ' + err.status);
		console.log('Error: ' + err.json);
	} else {
		result.json.data.toArray(function(err, dps) {
			if (err) { 
				console.log('There was an error')
			} else {
				console.log(dps)
				console.log('Total points: ' + dps.length);
			}
		});
	}
=======
    if (err) {
        console.log(err);
        console.log('Status code: ' + err.status);
        console.log('Error: ' + err.json);
    } else {
    console.log(result.json)
        result.json.data.toArray(function(err, dps) {
            if (err) { 
                console.log('There was an error')
            } else {
                console.log(dps)
                console.log('Total points: ' + dps.length);
            }
        });
    }
>>>>>>> e26bfd514e9ba622b1a9ba1aa2779e3eb1ba9e6f
});
