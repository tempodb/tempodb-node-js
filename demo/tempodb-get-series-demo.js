/* http://tempo-db.com/api/read-series/#read-series-by-key */

var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-database-id', 'my-key', 'my-secret')

// supply your own key here
var key = 'key1'
var count = 0

var start_time = new Date();
tempodb.getSeries(key, function(err, result){
    if (err) {
        console.log(err);
        console.log('Status code: ' + err.status);
        console.log('Error: ' + err.json);
    } else {
        console.log(result.json)
    }
});
