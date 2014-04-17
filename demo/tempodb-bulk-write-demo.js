/* http://tempo-db.com/api/write-series/#bulk-write-multiple-series */

var TempoDBClient = require('../lib/tempodb').TempoDBClient;
var tempodb = new TempoDBClient('my-database-id', 'my-api-key', 'my-api-secret');

var ts = new Date();

var data = [
    { key: "custom-series-key1", v: 1.11 },
    { key: "custom-series-key2", v: 2.22 },
    { key: "custom-series-key3", v: 3.33 },
    { key: "custom-series-key4", v: 4.44 },
];

tempodb.write_bulk(ts, data, function(result){
    var out = result.response;
    if (result.body) {
        out += ': ' + JSON.stringify(result.body);
    }
    console.log(out+'\n');
});
