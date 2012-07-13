/* http://tempo-db.com/api/write-series/#bulk-write-multiple-series */

var TempoDBClient = require('tempodb').TempoDBClient;
var tempodb = new TempoDBClient('your-api-key', 'your-api-secret')

var series_key1 = 'custom-series-key1';
var series_key2 = 'custom-series-key2';
var series_key3 = 'custom-series-key3';
var series_key4 = 'custom-series-key4';

var data = {
    t: new Date(),
    data: [
        { key: series_key1, v: 1.11 },
        { key: series_key2, v: 2.22 },
        { key: series_key3, v: 3.33 },
        { key: series_key4, v: 4.44 },
    ]
}

var start_time = new Date();

tempodb.write_bulk(data, function(result){
    var out = result.response;
    if (result.body) {
        out += ': ' + JSON.stringify(result.body);
    }
    console.log(out+'\n');
    console.log('Completed in', new Date() - start_time, 'ms\n');
});
