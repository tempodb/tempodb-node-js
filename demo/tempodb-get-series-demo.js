/* http://tempo-db.com/api/read-series/#read-series-by-key */

var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-database-id', 'my-key', 'my-secret')

// supply your own options here
var options = {}
var count = 0

var start_time = new Date();
tempodb.getSeries(options, function(err, result){
	if (err) {
		console.log(err);
		console.log('Status code: ' + err.status);
		console.log('Error: ' + err.json);
	} else {
    result.json.data.toArray(function(err, result) {
		  console.log(result)
		  console.log('Total series: ' + result.length);
    })
	}
});
