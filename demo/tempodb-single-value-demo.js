/* http://tempo-db.com/api/read-series/#read-series-by-key */

var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-database-id', 'my-key', 'my-secret');

var series_key = 'stuff',
    series_start_date = new Date('2012-01-01'),
    series_end_date = new Date('2012-01-02');

// read a date range
var options = {
  direction: 'nearest'
}
var count = 0

var start_time = new Date();
tempodb.singleValueByKey(series_key, '2012-01-01T01:21:00.000', options, function(err, result){
    if (err) {
        console.log(err);
        console.log('Status code: ' + err.status);
        console.log('Error: ' + err.json);
    } else {
    console.log(result.json)
    }
});
