var TempoDBClient = require('../tempodb').TempoDBClient;
var tempodb = new TempoDBClient('myagley','opensesame')
var cb = function(result){ console.log(result.response+': '+ JSON.stringify(result.body)); }

var options = {
    tag: ['foo']
}

var series = tempodb.get_series(options, cb);
