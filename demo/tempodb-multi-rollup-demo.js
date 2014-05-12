var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-database-id', 'my-key', 'my-secret');

var series_key = 'stuff',
    series_start_date = new Date('2012-01-01'),
    series_end_date = new Date('2012-01-02');

// read a date range
var options = {
    'rollup.period': '1hour',
    'rollup.fold': ['count', 'max', 'min', 'percentile,20'],
    limit: 1000
}
var count = 0

var start_time = new Date();
tempodb.getMultiRollups(series_key, series_start_date, series_end_date, options, function(err, result){
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
                console.log(dps);
                console.log('Total points: ' + dps.length);
            }
        });
    }
});
